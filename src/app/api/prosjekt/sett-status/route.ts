import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const { prosjektId, status } = await request.json();

  try {
    await db.prosjekt.update({
      where: { id: prosjektId },
      data: { status },
    });
    return NextResponse.json({ message: 'Prosjektstatus oppdatert' });
  } catch (error) {
    console.error('Feil ved oppdatering av prosjektstatus:', error);
    return NextResponse.json(
      { error: 'Feil ved oppdatering av prosjektstatus' },
      { status: 500 }
    );
  }
}