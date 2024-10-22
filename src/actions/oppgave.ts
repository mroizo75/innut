import { db } from "@/lib/db";
import { Oppgave, Prioritet } from "@prisma/client";
import { OppgaveStatus } from "@/utils/status-mapper";
import axios from 'axios';


export async function oppdaterOppgaveStatus(oppgaveId: string, nyStatus: OppgaveStatus) {
  return await db.oppgave.update({
    where: { id: oppgaveId },
    data: { status: nyStatus },
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
  });
}

export async function oppdaterOppgavePrioritet(oppgaveId: string, nyPrioritet: Prioritet) {
  return await db.oppgave.update({
    where: { id: oppgaveId },
    data: { prioritet: nyPrioritet },
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
  });
}

export async function leggTilKommentar(oppgaveId: string, brukerId: string, innhold: string) {
  return await db.kommentar.create({
    data: {
      innhold,
      oppgave: { connect: { id: oppgaveId } },
      bruker: { connect: { id: brukerId } },
    },
    include: {
      bruker: {
        select: {
          navn: true,
          bildeUrl: true,
        },
      },
    },
  });
}

export async function leggTilOppgave(data: any) {
  const response = await fetch('/api/oppgaver', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Feil ved oppretting av oppgave')
  }
  return response.json()
}

export const redigerOppgave = async (oppgaveId: string, oppgaveData: any) => {
  const { id, ...dataUtenId } = oppgaveData; // Fjern 'id' fra dataene

  const response = await fetch(`/api/oppgaver/${oppgaveId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataUtenId),
  });

  if (!response.ok) {
    throw new Error('Feil ved redigering av oppgave');
  }

  return await response.json();
};

export async function slettOppgave(oppgaveId: string) {
  try {
    const response = await axios.delete(`/api/oppgaver/${oppgaveId}`);
    if (response.status !== 200) {
      throw new Error('Feil ved sletting av oppgave');
    }
    return response.data;
  } catch (error) {
    console.error('Feil ved sletting av oppgave:', error);
    throw error;
  }
}

export async function registrerTid(oppgaveId: string, tid: number) {
  const oppgave = await db.oppgave.findUnique({ where: { id: oppgaveId } });
  if (!oppgave) throw new Error("Oppgave ikke funnet");

  const nyFaktiskTid = (oppgave.faktiskTid || 0) + tid;

  return await db.oppgave.update({
    where: { id: oppgaveId },
    data: { faktiskTid: nyFaktiskTid },
  });
}
