// src/actions/prosjekt.ts
import { db } from "@/lib/db";

// Funksjon for å hente og oppdatere prosjekter
export async function getProsjekter() {
  const today = new Date();

  // Oppdater prosjekter som skal starte i dag eller tidligere
  await db.prosjekt.updateMany({
    where: {
      status: 'IKKE_STARTET',
      startDato: {
        lte: today,
      },
    },
    data: {
      status: 'STARTET',
    },
  });

  // Hent alle prosjekter
  const prosjekter = await db.prosjekt.findMany({
    include: {
      oppgaver: true,
      bedrift: true,
    },
  });

  return prosjekter;
}