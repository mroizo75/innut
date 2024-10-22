import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { OppgaveStatus, oppgaveStatusTilTekst } from "@/utils/status-mapper";
import { slettOppgave } from '@/actions/oppgave';

interface ProsjektTabellProps {
  prosjekt: any;
  currentUser: any;
  onEditOppgave: (oppgave: any) => void;
  onDeleteOppgave: (oppgaveId: string) => void;
}

const ProsjektTabell: React.FC<ProsjektTabellProps> = ({
  prosjekt,
  currentUser,
  onEditOppgave,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tittel</TableHead>
          <TableHead>Beskrivelse</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ansvarlig</TableHead>
          <TableHead>Startdato</TableHead>
          <TableHead>Sluttdato</TableHead>
          <TableHead>Handlinger</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prosjekt.oppgaver.map((oppgave: any) => (
          <TableRow key={oppgave.id}>
            <TableCell>{oppgave.tittel}</TableCell>
            <TableCell>{oppgave.beskrivelse}</TableCell>
            <TableCell>{oppgaveStatusTilTekst[oppgave.status]}</TableCell>
            <TableCell>{`${oppgave.bruker.navn} ${oppgave.bruker.etternavn}`}</TableCell>
            <TableCell>{new Date(oppgave.startDato).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(oppgave.sluttDato).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditOppgave(oppgave)}
                className="mr-2"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => slettOppgave(oppgave.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProsjektTabell;
