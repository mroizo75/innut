// src/app/api/generer-endringsskjema-pdf/[id]/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const skjemaId = params.id;

  if (!skjemaId) {
    return NextResponse.json(
      { error: 'Skjema ID er påkrevd' },
      { status: 400 }
    );
  }

  try {
    const skjema = await db.endringsSkjema.findUnique({
      where: { id: skjemaId },
      include: {
        opprettetAv: true,
        behandler: true,
      },
    });

    if (!skjema) {
      return NextResponse.json(
        { error: 'Skjema ikke funnet' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Feil ved henting av endringsskjema:', error);
    return NextResponse.json(
      { error: 'Kunne ikke generere PDF' },
      { status: 500 }
    );
  }
}