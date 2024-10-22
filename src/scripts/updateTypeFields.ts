import { db } from "@/lib/db";

async function main() {
  // Oppdater eksisterende 'avvik' til 'Avvik' i Skjema-tabellen
  await db.skjema.updateMany({
    where: { type: 'avvik' },
    data: { type: 'Avvik' },
  });

  // Oppdater eksisterende 'endring' til 'Endring' i EndringsSkjema-tabellen
  await db.endringsSkjema.updateMany({
    where: { type: 'endring' },
    data: { type: 'Endring' },
  });

  // Oppdater eksisterende 'sja' til 'SJA' i SJASkjema-tabellen
  await db.sJASkjema.updateMany({
    where: { type: 'sja' },
    data: { type: 'SJA' },
  });
}

main()
  .then(async () => {
    await db.$disconnect();
    console.log('Oppdatering fullført');
  })
  .catch(async (error) => {
    console.error('Feil under oppdatering:', error);
    await db.$disconnect();
    process.exit(1);
  });