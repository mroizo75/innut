import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import DashboardHeader from '@/components/DashboardHeader';
import AnsatteListe from '@/components/AnsatteListe';

const AnsattePage = async () => {
  const session = await auth();

  // Sjekk om brukeren er autentisert
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Hent brukeren fra databasen
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  // Sjekk om brukeren har tilgang (ADMIN eller LEDER)
  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'LEDER') {
    redirect('/404');
  }

  // Hent alle ansatte i bedriften
  const ansatte = await db.user.findMany({
    where: {
      bedriftId: currentUser?.bedriftId,
    },
    include: {
      bedrift: true,
    },
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <h1 className="text-3xl font-bold mb-6">Ansatte oversikt</h1>
        {/* Send ansatte-data til Client Component */}
        <AnsatteListe ansatte={ansatte} />
      </main>
    </div>
  );
};

export default AnsattePage;
