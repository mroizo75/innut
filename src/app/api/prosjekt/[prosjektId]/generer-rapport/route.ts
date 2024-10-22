import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
export async function GET(
  request: Request,
  { params }: { params: { prosjektId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
  }

  const prosjektId = params.prosjektId;

  try {
    // Hent prosjektet og relaterte data
    const prosjekt = await db.prosjekt.findUnique({
      where: { id: prosjektId },
      include: {
        timeEntries: true,
        oppgaver: true,
      },
    });
  
    if (!prosjekt) {
      return NextResponse.json({ error: 'Prosjekt ikke funnet' }, { status: 404 });
    }
  
    // Hent brukerinformasjon for timeEntries
    const userIds = [...new Set(prosjekt.timeEntries.map(entry => entry.brukerId))];
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, navn: true, etternavn: true },
    });
  
    // Lag en mapping fra userId til brukernavn
    const userMap = new Map(users.map(user => [user.id, `${user.navn} ${user.etternavn}`]));
    // Opprett Excel-arbeidsbok
    const workbook = new ExcelJS.Workbook();

    // Last inn malfilen hvis du bruker en (se neste steg)
    // const templateBuffer = fs.readFileSync('path/to/template.xlsx');
    // await workbook.xlsx.load(templateBuffer);

   // Opprett Excel-arbeidsbok
const worksheet = workbook.addWorksheet('Prosjektrapport');

// Legg til kolonneoverskrifter
worksheet.columns = [
  { header: 'Dato', key: 'dato', width: 15 },
  { header: 'Bruker', key: 'bruker', width: 25 },
  { header: 'Timer', key: 'timer', width: 10 },
  { header: 'Beskrivelse', key: 'beskrivelse', width: 30 },
];

// Legg til timeEntries-data
prosjekt.timeEntries.forEach((entry) => {
  worksheet.addRow({
    dato: entry.date.toISOString().split('T')[0],
    bruker: userMap.get(entry.userId) || 'Ukjent bruker',
    timer: entry.hours,
    beskrivelse: entry.description || '',
  });
});
    // GENERERE PIVOTTABEL OG GRAF ER IKKE DIREKTE STØTTET I EXCELJS
    // Men du kan legge inn manuell oppretting via en mal (se neste steg)

    // Generer buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=prosjektrapport_${prosjektId}.xlsx`,
      },
    });
  } catch (error) {
    console.error('Feil ved generering av rapport:', error);
    return NextResponse.json({ error: 'Feil ved generering av rapport' }, { status: 500 });
  }
}