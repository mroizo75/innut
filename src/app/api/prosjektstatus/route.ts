import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET() {
  const today = new Date();

  try {
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
    return NextResponse.json({ message: 'Prosjektstatus oppdatert.' });
  } catch (error) {
    console.error('Feil ved oppdatering av prosjektstatus:', error);
    return NextResponse.json({ error: 'Feil ved oppdatering av prosjektstatus.' }, { status: 500 });
  }
}