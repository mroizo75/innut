import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Oppgave, OppgaveStatus, Prioritet } from '@prisma/client';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface OppgaveListeProps {
  oppgaver: Oppgave[];
  onRedigerOppgave: (oppgave: Oppgave) => void;
}

const OppgaveListe: React.FC<OppgaveListeProps> = ({ oppgaver, onRedigerOppgave }) => {
  const [statusFilter, setStatusFilter] = useState<OppgaveStatus | 'ALL'>('ALL');
  const [prioritetFilter, setPrioritetFilter] = useState<Prioritet | 'ALL'>('ALL');
  const [sortering, setSortering] = useState<'tittel' | 'sluttDato'>('sluttDato');
  const [søk, setSøk] = useState('');

  const filtrerteOgSorterteOppgaver = useMemo(() => {
    return oppgaver
      .filter(oppgave => 
        (statusFilter === 'ALL' || oppgave.status === statusFilter) &&
        (prioritetFilter === 'ALL' || oppgave.prioritet === prioritetFilter) &&
        (oppgave.tittel.toLowerCase().includes(søk.toLowerCase()) || 
         oppgave.beskrivelse.toLowerCase().includes(søk.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortering === 'tittel') {
          return a.tittel.localeCompare(b.tittel);
        } else {
          return a.sluttDato.getTime() - b.sluttDato.getTime();
        }
      });
  }, [oppgaver, statusFilter, prioritetFilter, sortering, søk]);

  const getStatusColor = (status: OppgaveStatus) => {
    switch (status) {
      case OppgaveStatus.IKKE_STARTET: return "bg-gray-200 text-gray-800";
      case OppgaveStatus.I_GANG: return "bg-blue-200 text-blue-800";
      case OppgaveStatus.FULLFORT: return "bg-green-200 text-green-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const getPriorityColor = (prioritet: Prioritet) => {
    switch (prioritet) {
      case Prioritet.LAV: return "bg-green-200 text-green-800";
      case Prioritet.MEDIUM: return "bg-yellow-200 text-yellow-800";
      case Prioritet.HOY: return "bg-red-200 text-red-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Select onValueChange={(value) => setStatusFilter(value as OppgaveStatus | 'ALL')}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrer på status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Alle</SelectItem>
            {Object.values(OppgaveStatus).map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setPrioritetFilter(value as Prioritet | 'ALL')}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrer på prioritet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Alle</SelectItem>
            {Object.values(Prioritet).map((prioritet) => (
              <SelectItem key={prioritet} value={prioritet}>{prioritet}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setSortering(value as 'tittel' | 'sluttDato')}>
          <SelectTrigger>
            <SelectValue placeholder="Sorter etter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tittel">Tittel</SelectItem>
            <SelectItem value="sluttDato">Sluttdato</SelectItem>
          </SelectContent>
        </Select>
        <Input 
          placeholder="Søk i oppgaver" 
          value={søk} 
          onChange={(e) => setSøk(e.target.value)}
        />
      </div>
      {filtrerteOgSorterteOppgaver.map((oppgave) => (
        <div key={oppgave.id} className="bg-white shadow rounded-lg p-4">
          <Link href={`/oppgaver/${oppgave.id}`}>
            <h3 className="text-lg font-semibold">{oppgave.tittel}</h3>
          </Link>
          <p className="text-sm text-gray-600">{oppgave.beskrivelse}</p>
          <div className="mt-2 flex justify-between items-center">
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(oppgave.status)}`}>
              {oppgave.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(oppgave.prioritet)}`}>
              {oppgave.prioritet}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Estimert tid: {oppgave.estimertTid} timer</span>
            <span className="text-xs text-gray-500 ml-2">Faktisk tid: {oppgave.faktiskTid} timer</span>
          </div>
          <Button onClick={() => onRedigerOppgave(oppgave)}>Rediger</Button>
        </div>
      ))}
</div>
);
};
export default OppgaveListe;