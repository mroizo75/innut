"use server"
import * as z from "zod"
import bcrypt from "bcryptjs"
import { RegisterSchema } from "@/schemas"
import { db } from "@/lib/db"
import { generateVerificationToken } from "@/utils/token"
import { sendVerificationEmail } from "@/lib/mail"
import fetch from 'node-fetch'

// Legg til denne funksjonen for å verifisere organisasjonsnummeret
const verifyOrgnr = async (orgnr: string) => {
  try {
    const response = await fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      // Hvis responsen ikke er OK, betyr det at organisasjonsnummeret ikke finnes
      return null;
    }
  } catch (error) {
    console.error('Feil ved verifisering av organisasjonsnummer:', error);
    return null;
  }
};

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Ugyldig input" };
  }

  const {
    email,
    password,
    navn,
    etternavn,
    bedriftNavn,
    orgnr,
    postnr,
    sted,
  } = validatedFields.data;

  // Verifiser organisasjonsnummeret før du fortsetter
  const orgData = await verifyOrgnr(orgnr);
  if (!orgData) {
    return { error: "Organisasjonsnummeret er ikke registrert i Brønnøysundregistrene" };
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Bruker eksisterer allerede" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const eksisterendeBedrift = await db.bedrift.findUnique({
      where: { orgnr },
    });

    if (eksisterendeBedrift) {
      return {
        error: "En bedrift med dette organisasjonsnummeret eksisterer allerede i systemet",
      };
    }

    // Opprett bedriften
    const bedrift = await db.bedrift.create({
      data: {
        navn: bedriftNavn,
        orgnr,
        postnr,
        sted,
      },
    });

    // Opprett brukeren
    const user = await db.user.create({
      data: {
        email,
        password: passwordHash,
        navn,
        etternavn,
        role: 'ADMIN', // Endre om nødvendig
        bedriftId: bedrift.id,
        emailVerified: null, // Sørg for at dette feltet finnes i databasen
      },
    });

    // Generer verifikasjonstoken og send verifikasjons-e-post
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(
      email,
      verificationToken.token,
      "Verifiser e-posten din"
    );

    return { success: true, message: "Bruker opprettet. En verifikasjons-e-post er sendt." };

  } catch (error) {
    console.error("Feil under registrering:", error);
    return { error: "Kunne ikke opprette bruker og bedrift" };
  } finally {
    await db.$disconnect();
    console.log("Register-funksjonen er ferdig");
  }
}
