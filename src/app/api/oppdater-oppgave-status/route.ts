import { NextResponse } from 'next/server';
import { oppdaterOppgaveStatus } from '@/actions/oppgave';

export async function POST(request: Request) {
  const { oppgaveId, nyStatus } = await request.json();

  if (!oppgaveId || !nyStatus) {
    return NextResponse.json({ error: 'Manglende data' }, { status: 400 });
  }

  try {
    const oppdatertOppgave = await oppdaterOppgaveStatus(oppgaveId, nyStatus);
    return NextResponse.json({ success: true, oppgave: oppdatertOppgave });
  } catch (error) {
    console.error('Feil ved oppdatering av oppgavestatus:', error);
    return NextResponse.json({ error: 'Feil ved oppdatering av oppgavestatus' }, { status: 500 });
  }
}