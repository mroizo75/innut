import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import DashboardHeader from '@/components/DashboardHeader';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const AnsattDetaljerPage = async ({ params }: { params: { ansattId: string } }) => {
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

  // Hent ansattens detaljer
  const ansatt = await db.user.findUnique({
    where: { id: params.ansattId },
    include: {
      bedrift: true,
      oppgaver: {
        include: {
          prosjekt: true,
        },
      },
      timeEntries: true,
    },
  });

  if (!ansatt) {
    return <div>Ansatt ikke funnet</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <h1 className="text-3xl font-bold mb-6">{`${ansatt.navn} ${ansatt.etternavn}`}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold">Personlig informasjon</h2>
            <p><strong>E-post:</strong> {ansatt.email}</p>
            <p><strong>Stilling:</strong> {ansatt.position || 'Ikke satt'}</p>
            <p><strong>Rolle:</strong> {ansatt.role}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Bedrift</h2>
            <p><strong>Navn:</strong> {ansatt.bedrift.navn}</p>
            <p><strong>Organisasjonsnummer:</strong> {ansatt.bedrift.orgnr}</p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Oppgaver</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tittel</TableHead>
                <TableHead>Prosjekt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Frist</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ansatt.oppgaver.map((oppgave) => (
                <TableRow key={oppgave.id}>
                  <TableCell>{oppgave.tittel}</TableCell>
                  <TableCell>{oppgave.prosjekt.navn}</TableCell>
                  <TableCell>{oppgave.status}</TableCell>
                  <TableCell>{oppgave.sluttDato ? new Date(oppgave.sluttDato).toLocaleDateString() : 'Ikke satt'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default AnsattDetaljerPage;

