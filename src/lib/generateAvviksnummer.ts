import { db } from '@/lib/db';

export async function generateAvviksnummer() {
  // Hent dagens dato i formatet YYYYMMDD
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');

  // Tell hvor mange avviksregistreringer som er gjort i dag
  const count = await db.skjema.count({
    where: {
      type: 'Avvik',
      opprettetDato: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
      },
    },
  });

  // Generer avviksnummer: AVVIK-YYYYMMDD-<løpenummer>
  const sequence = (count + 1).toString().padStart(4, '0');
  const avviksnummer = `AVVIK-${datePart}-${sequence}`;

  return avviksnummer;
}