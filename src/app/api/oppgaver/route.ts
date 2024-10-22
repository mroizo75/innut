import { NextResponse } from 'next/server'
import { db } from "@/lib/db"
import { OppgaveStatus, Prioritet } from "@prisma/client"

export async function GET(request: Request) {
    const oppgaver = await db.oppgave.findMany({
        include: {
            prosjekt: true,
            bruker: true,
            filer: true,
        },
    });
    return NextResponse.json(oppgaver);
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
     // Finn alle brukere tilknyttet prosjektet
  const brukere = await db.user.findMany({
    where: {
      prosjekter: {
        some: {
          id: data.prosjektId,
        },
      },
    },
  });

  // Opprett varsler og send Socket.IO-hendelser
  for (const bruker of brukere) {
    // Opprett varsel i databasen
    await db.notification.create({
      data: {
        message: `Ny oppgave "${nyOppgave.tittel}" opprettet i prosjektet "${nyOppgave.prosjekt.navn}".`,
        userId: bruker.id,
        url: `/prosjekt/${data.prosjektId}/oppgaver/${nyOppgave.id}`,
      },
    });

    // Send varsel via Socket.IO
    if (global.io) {
      global.io.to(bruker.id).emit('nyNotifikasjon', {
        message: `Ny oppgave "${nyOppgave.tittel}" opprettet i prosjektet "${nyOppgave.prosjekt.navn}".`,
        url: `/prosjekt/${data.prosjektId}/oppgaver/${nyOppgave.id}`,
      });
    }
  }
    return NextResponse.json(nyOppgave)
}

