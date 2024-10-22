import { NextRequest, NextResponse } from 'next/server'
import { db } from "@/lib/db"
import { OppgaveStatus } from '@prisma/client'
import { Prioritet } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest, { params }: { params: { oppgaveId: string } }) {
    const { oppgaveId } = params
    const oppgave = await db.oppgave.findUnique({
        where: { id: oppgaveId },
        include: {
            prosjekt: true,
            bruker: true,
            filer: true,
            kommentarer: {
                include: {
                    bruker: true,
                },
            },
        },
    })
    if (!oppgave) {
        return NextResponse.json({ error: 'Oppgave ikke funnet' }, { status: 404 })
    }
    return NextResponse.json(oppgave)
}

export async function POST(request: Request) {
    const data = await request.json()
    const nyOppgave = await db.oppgave.create({
        data: {
            tittel: data.tittel,
            beskrivelse: data.beskrivelse,
            startDato: new Date(data.startDato),
            sluttDato: new Date(data.sluttDato),
            status: data.status || OppgaveStatus.IKKE_STARTET,
            prioritet: data.prioritet || Prioritet.MEDIUM,
            estimertTid: data.estimertTid || 0,
            faktiskTid: 0,
            prosjekt: {
                connect: { id: data.prosjektId }
            },
            bruker: data.brukerId ? {
                connect: { id: data.brukerId }
            } : undefined
        },
        include: {
            filer: true,
            bruker: {
                select: {
                    navn: true,
                    etternavn: true,
                    bildeUrl: true,
                },
            },
            kommentarer: {
                include: {
                    bruker: {
                        select: {
                            navn: true,
                            bildeUrl: true,
                        },
                    },
                },
            },
        },
    })
    return NextResponse.json(nyOppgave)
}

export async function PUT(request: NextRequest, { params }: { params: { oppgaveId: string } }) {
    const { oppgaveId } = params
    const data = await request.json()
    const oppdatertOppgave = await db.oppgave.update({
        where: { id: oppgaveId },
        data,
        include: {
            filer: true,
            bruker: {
                select: {
                    navn: true,
                    etternavn: true,
                    bildeUrl: true,
                },
            },
            kommentarer: {
                include: {
                    bruker: {
                        select: {
                            navn: true,
                            bildeUrl: true,
                        },
                    },
                },
            },
        },
    })
    return NextResponse.json(oppdatertOppgave)
}

export async function DELETE(request: NextRequest, { params }: { params: { oppgaveId: string } }) {
    const { oppgaveId } = params
    await db.oppgave.delete({
        where: { id: oppgaveId },
    })
    return NextResponse.json({ message: 'Oppgave slettet' })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { oppgaveId: string } }
) {
  const oppgaveId = params.oppgaveId;
  const data = await request.json();

  try {
    const oppdatertOppgave = await db.oppgave.update({
      where: { id: oppgaveId },
      data: {
        // Oppdater oppgavefelt basert på data
        ...data,
      },
    });

    // Revalidere prosjektsiden
    revalidatePath('/prosjekter');

    return NextResponse.json(oppdatertOppgave);
  } catch (error) {
    console.error('Feil ved oppdatering av oppgave:', error);
    return NextResponse.json(
      { error: 'Feil ved oppdatering av oppgave' },
      { status: 500 }
    );
  }
}
