import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { date, hours, description, prosjektId, oppgaveId } = await req.json()

  try {
    const timeEntry = await db.timeEntry.create({
      data: {
        date: new Date(date),
        hours,
        description,
        prosjekt: {
          connect: { id: prosjektId }
        },
        oppgave: oppgaveId ? { connect: { id: oppgaveId } } : undefined,
        bruker: { connect: { id: session.user.id } }
      },
      include: {
        prosjekt: true,
        oppgave: true
      }
    })
    return NextResponse.json(timeEntry)
  } catch (error) {
    console.error('Feil ved opprettelse av timeregistrering:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}