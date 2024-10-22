import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { db } from '@/lib/db'

export async function PUT(req: NextRequest, { params }) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ message: 'Ikke autentisert' }, { status: 401 })
  }

  const { status } = await req.json()
  const oppgaveId = params.oppgaveId

  const oppgave = await db.oppgave.findUnique({
    where: { id: oppgaveId },
  })

  if (oppgave?.brukerId !== session.user.id) {
    return NextResponse.json({ message: 'Ingen tilgang' }, { status: 403 })
  }

  await db.oppgave.update({
    where: { id: oppgaveId },
    data: { status },
  })

  return NextResponse.json({ message: 'Status oppdatert' })
}