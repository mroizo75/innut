import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data) {
      return NextResponse.json({ error: 'Manglende data' }, { status: 400 });
    }

    const newSkjema = await db.sJASkjema.create({
      data: {
        jobTitle: data.jobTitle,
        jobLocation: data.jobLocation,
        jobDate: data.jobDate,
        participants: data.participants,
        jobDescription: data.jobDescription,
        identifiedRisks: data.identifiedRisks,
        riskMitigation: data.riskMitigation,
        responsiblePerson: data.responsiblePerson,
        approvalDate: data.approvalDate,
        comments: data.comments,
        status: 'Ubehandlet',
        opprettetAvId: session.user.id,
        bedriftId: session.user.bedriftId,
      },
    });

    return NextResponse.json({ success: true, data: newSkjema });
  } catch (error) {
    console.error('Feil ved opprettelse av SJA-skjema:', error);
    return NextResponse.json({ error: 'Kunne ikke opprette SJA-skjema' }, { status: 500 });
  }
}