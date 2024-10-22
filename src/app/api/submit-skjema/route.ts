import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
  }

  const { type, tittel, innhold } = await request.json();

  try {
    const skjema = await db.skjema.create({
      data: {
        type,
        tittel,
        innhold,
        status: 'Ubehandlet',
        bedriftId: session.user.bedriftId,
        opprettetAvId: session.user.id,
      },
    });

    revalidatePath('/skjemaboard');

    return NextResponse.json({ success: true, skjema });
  } catch (error) {
    console.error('Feil ved oppretting av skjema:', error);
    return NextResponse.json({ error: 'Kunne ikke opprette skjema' }, { status: 500 });
  }
}