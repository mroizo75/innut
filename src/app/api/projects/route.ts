import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const data = await request.json();
  const { tittel, responsible, description } = data;

  try {
    const newAvvik = await db.skjema.create({
      data: {
        tittel,
        status: 'Ubehandlet',
        opprettetDato: new Date(),
        innhold: {
          responsible,
          description,
        },
        // Legg til andre nødvendige felter
      },
    });
    return NextResponse.json({ success: true, avvik: newAvvik });
  } catch (error) {
    console.error("Feil ved opprettelse av avvik:", error);
    return NextResponse.json({ success: false, error: 'Kunne ikke opprette avvik' }, { status: 500 });
  }
}