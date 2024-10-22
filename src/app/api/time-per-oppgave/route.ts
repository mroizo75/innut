import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 });
  }

  // Hent brukeren fra databasen
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  // Sjekk om brukeren har tilgang (ADMIN, LEDER eller PROSJEKTLEDER)
  if (
    currentUser?.role !== 'ADMIN' &&
    currentUser?.role !== 'LEDER' &&
    currentUser?.role !== 'PROSJEKTLEDER'
  ) {
    return NextResponse.json({ error: 'Ingen tilgang' }, { status: 403 });
  }

  // Hent alle oppgaver i tilhørende bedrift
  const oppgaver = await db.oppgave.findMany({
    where: {
      prosjekt: {
        bedriftId: currentUser.bedriftId,
      },
    },
    include: {
      prosjekt: true,
      bruker: true,
    },
  });

  // Hent alle TimeEntry-poster for disse oppgavene
  const timeEntries = await db.timeEntry.findMany({
    where: {
      oppgaveId: {
        in: oppgaver.map((oppgave) => oppgave.id),
      },
    },
  });

  // Aggregere timer per oppgave
  const timerPerOppgave: { [key: string]: number } = {};
  timeEntries.forEach((entry) => {
    if (entry.oppgaveId) {
      if (!timerPerOppgave[entry.oppgaveId]) {
        timerPerOppgave[entry.oppgaveId] = 0;
      }
      timerPerOppgave[entry.oppgaveId] += entry.hours;
    }
  });

  // Bygg dataobjektet
  const data = oppgaver.map((oppgave) => {
    const totaltimer = timerPerOppgave[oppgave.id] || 0;
    return {
      oppgaveId: oppgave.id,
      tittel: oppgave.tittel,
      prosjektNavn: oppgave.prosjekt.navn,
      ansattNavn: oppgave.bruker
        ? `${oppgave.bruker.navn} ${oppgave.bruker.etternavn}`
        : 'Ikke tildelt',
      totaltimer,
      status: oppgave.status,
      sluttDato: oppgave.sluttDato,
    };
  });

  return NextResponse.json(data);
}
