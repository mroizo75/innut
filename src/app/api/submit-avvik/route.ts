import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { generateAvviksnummer } from '@/lib/generateAvviksnummer';

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 });
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  const { tittel, innhold, prosjektId } = await request.json();

  try {
    const avviksnummer = await generateAvviksnummer();

    const nyttAvvik = await db.skjema.create({
      data: {
        type: 'Avvik',
        tittel,
        innhold,
        avviksnummer,
        opprettetAv: {
          connect: { id: currentUser.id },
        },
        bedrift: {
          connect: { id: currentUser.bedriftId },
        },
        ...(prosjektId && { prosjekt: { connect: { id: prosjektId } } }),
      },
    });

    return NextResponse.json({ message: 'Avviksskjema opprettet', avviksnummer });
  } catch (error) {
    console.error('Feil ved opprettelse av avviksskjema:', error);
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 });
  }
}
