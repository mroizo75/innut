// src/app/api/archived-skjemaer/route.ts
import { NextResponse } from 'next/server';
import { getAllArchivedSkjemaer } from '@/actions/skjema';

export async function GET() {
  try {
    const allArchivedSkjemaer = await getAllArchivedSkjemaer();
    return NextResponse.json(allArchivedSkjemaer);
  } catch (error) {
    console.error('Feil ved henting av arkiverte skjemaer:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente arkiverte skjemaer' },
      { status: 500 }
    );
  }
}