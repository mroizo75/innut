import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { id } = params
  const { date, hours, description, prosjektId, oppgaveId } = await req.json()

  try {
    const updateData = {
      date: new Date(date),
      hours: parseFloat(hours),
      description,
      prosjekt: { connect: { id: prosjektId } }
    }

    if (oppgaveId) {
      updateData.oppgave = { connect: { id: oppgaveId } }
    } else {
      updateData.oppgave = { disconnect: true }
    }

    const timeEntry = await db.timeEntry.update({
      where: { id },
      data: updateData,
      include: {
        prosjekt: true,
        oppgave: true
      }
    })

    return NextResponse.json(timeEntry)
  } catch (error) {
    console.error('Feil ved oppdatering av timeregistrering:', error)
    return new NextResponse(JSON.stringify({ error: 'Feil ved oppdatering av timeregistrering', details: error.message }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
  }

  const { id } = params

  try {
    await db.timeEntry.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Timeregistrering slettet' }, { status: 200 })
  } catch (error) {
    console.error('Feil ved sletting av timeregistrering:', error)
    return NextResponse.json({ error: 'Kunne ikke slette timeregistrering' }, { status: 500 })
  }
}

