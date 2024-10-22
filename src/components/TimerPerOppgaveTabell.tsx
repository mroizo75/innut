'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface OppgaveData {
  oppgaveId: string;
  tittel: string;
  prosjektNavn: string;
  ansattNavn: string;
  totaltimer: number;
  status: string;
  sluttDato: string | null;
}

const TimerPerOppgaveTabell = () => {
  const [data, setData] = useState<OppgaveData[]>([]);
  const [sortKey, setSortKey] = useState<keyof OppgaveData>("tittel");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/time-per-oppgave');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const jsonData: OppgaveData[] = await res.json();
        setData(jsonData);
      } catch (error) {
        console.error('Feil ved henting av data:', error);
      }
    };

    fetchData();
  }, []);

  const sortData = (key: keyof OppgaveData) => {
    let order: "asc" | "desc" = "asc";
    if (sortKey === key && sortOrder === "asc") {
      order = "desc";
    }
    setSortKey(key);
    setSortOrder(order);
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortKey];
    let bValue = b[sortKey];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (sortKey === "sluttDato" && aValue && bValue) {
      aValue = new Date(aValue as string);
      bValue = new Date(bValue as string);
    }

    if (aValue < bValue) {
      return sortOrder === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === "asc" ? 1 : -1;
    }
    return 0;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="cursor-pointer" onClick={() => sortData("tittel")}>
            Oppgave {sortKey === "tittel" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => sortData("prosjektNavn")}>
            Prosjekt {sortKey === "prosjektNavn" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => sortData("ansattNavn")}>
            Ansvarlig {sortKey === "ansattNavn" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => sortData("status")}>
            Status {sortKey === "status" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => sortData("sluttDato")}>
            Sluttdato {sortKey === "sluttDato" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => sortData("totaltimer")}>
            Totaltimer {sortKey === "totaltimer" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((oppgave) => (
          <TableRow key={oppgave.oppgaveId}>
            <TableCell>{oppgave.tittel}</TableCell>
            <TableCell>{oppgave.prosjektNavn}</TableCell>
            <TableCell>{oppgave.ansattNavn}</TableCell>
            <TableCell>{oppgave.status}</TableCell>
            <TableCell>
              {oppgave.sluttDato
                ? new Date(oppgave.sluttDato).toLocaleDateString()
                : 'Ikke satt'}
            </TableCell>
            <TableCell>{oppgave.totaltimer} timer</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TimerPerOppgaveTabell;
