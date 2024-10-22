'use client';

import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';

interface Oppgave {
  id: string;
  tittel: string;
  prosjekt: { id: string; navn: string };
  status: string;
  sluttDato?: Date | null;
}

interface OppgaverTabellProps {
  oppgaver: Oppgave[];
}

const OppgaverTabell: React.FC<OppgaverTabellProps> = ({ oppgaver }) => {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Oppgave</TableHead>
          <TableHead>Prosjekt</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Frist</TableHead>
          <TableHead>Handling</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {oppgaver.map((oppgave) => (
          <TableRow key={oppgave.id}>
            <TableCell>{oppgave.tittel}</TableCell>
            <TableCell>{oppgave.prosjekt.navn}</TableCell>
            <TableCell>{oppgave.status}</TableCell>
            <TableCell>
              {oppgave.sluttDato
                ? new Date(oppgave.sluttDato).toLocaleDateString()
                : 'Ikke satt'}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(
                    `/kanban/${oppgave.prosjekt.id}?oppgave=${oppgave.id}`
                  )
                }
              >
                <Activity className="mr-2 h-4 w-4" />
                Vis på Kanban
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OppgaverTabell;