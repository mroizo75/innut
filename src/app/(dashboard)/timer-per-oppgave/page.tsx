import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import DashboardHeader from '@/components/DashboardHeader';
import TimerPerOppgaveTabell from '@/components/TimerPerOppgaveTabell';

const TimerPerOppgavePage = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  // Sjekk om brukeren har tilgang
  if (
    currentUser?.role !== 'ADMIN' &&
    currentUser?.role !== 'LEDER' &&
    currentUser?.role !== 'PROSJEKTLEDER'
  ) {
    redirect('/404');
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <h1 className="text-3xl font-bold mb-6">Timer per Oppgave</h1>
        <TimerPerOppgaveTabell />
      </main>
    </div>
  );
};

export default TimerPerOppgavePage;

