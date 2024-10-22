"use server"
import * as z from "zod";
import { AuthError } from "next-auth";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { sendVerificationEmail } from "@/lib/mail";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { generateVerificationToken } from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";


export const login = async (values: z.infer<typeof LoginSchema>) => {
    console.log("Login forsøk startet", values);

    const validatedFields = LoginSchema.safeParse(values)

    if (!validatedFields.success) {
        console.log("Validering feilet", validatedFields.error);
        return {
            error: "Ugyldig epost eller passord"
        }
    }
    
    const { email, password } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.email || !existingUser.password) {
        return { error: "Bruker ikke funnet" }
    }

    if (!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(existingUser.email);
        await sendVerificationEmail(
            existingUser.email,            // Bruker 'existingUser.email' direkte
            verificationToken.token,
            "Verifiser e-posten din"       // Legger til 'subject' parameteren
        );
        return { success: "Verifiser eposten din" };
    }

    try {
        await signIn("credentials", { 
            email, 
            password, 
            redirectTo: DEFAULT_LOGIN_REDIRECT,
        })
        const result = await signIn("credentials", { 
            email, 
            password, 
            redirect: false,
        })
        if (result?.error) {
            return { error: result.error }
        }
        return { success: "Innlogging vellykket" }
    } catch (error) {
        if (error instanceof AuthError) {
           switch (error.type) {
            case "CredentialsSignin":
                return { error: "Ugyldig epost eller passord" }
            default:
                return { error: "Noe gikk galt" }
           }
        }
        throw error
    }
};