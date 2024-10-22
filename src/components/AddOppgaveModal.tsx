"use client"
import { useState } from "react"
import useSWR from 'swr'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { leggTilOppgave } from "@/actions/oppgave"
import { OppgaveStatus, Prioritet } from "@prisma/client"

interface Oppgave {
  id: string;
  tittel: string;
  beskrivelse?: string;
  startDato: string;
  sluttDato: string;
  brukerId?: string;
  estimertTid?: number;
  status: OppgaveStatus;
}

interface AddOppgaveModalProps {  
  prosjektId: string;
  onAdd: (oppgave: Oppgave) => void;
  currentUser: {
    bedriftId?: string;
  };
}

export function AddOppgaveModal({ prosjektId, onAdd, currentUser }: AddOppgaveModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const fetcher = (url: string) => axios.get(url).then(res => res.data)

  const { data: brukere = [], error } = useSWR(
    currentUser?.bedriftId ? `/api/get-users?bedriftId=${currentUser.bedriftId}` : null,
    fetcher
  )

  if (error) {
    console.error('Feil ved henting av brukere:', error)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    data.prosjektId = prosjektId
    data.estimertTid = Number(data.estimertTid) || 0
    
    const response = await fetch('/api/oppgaver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  
    if (response.ok) {
      const nyOppgave = await response.json()
      onAdd(nyOppgave)
      setIsOpen(false)
    } else {
      console.error('Feil ved opprettelse av oppgave')
    }
  }

 
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mt-2">Legg til ny oppgave</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legg til ny oppgave</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <Input name="tittel" placeholder="Oppgavetittel" required />
          <Textarea name="beskrivelse" placeholder="Beskrivelse" />
          <Input name="startDato" type="date" required />
          <Input name="sluttDato" type="date" required />
          <Input name="estimertTid" type="number" placeholder="Estimert tid (timer)" />
                    <Select name="status">
            <SelectTrigger>
              <SelectValue placeholder="Velg status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(OppgaveStatus).map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="prioritet">
            <SelectTrigger>
              <SelectValue placeholder="Velg prioritet" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Prioritet).map((prioritet) => (
                <SelectItem key={prioritet} value={prioritet}>{prioritet}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="brukerId">
            <SelectTrigger>
              <SelectValue placeholder="Velg bruker" />
            </SelectTrigger>
            <SelectContent>
              {brukere.length > 0 ? (
                brukere.map((bruker: { id: string; navn: string; etternavn: string }) => (
                  <SelectItem key={bruker.id} value={bruker.id}>
                    {bruker.navn} {bruker.etternavn}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value={""}>Ingen brukere funnet</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Input name="filer" type="file" accept="*" multiple />
          <Button type="submit">Legg til oppgave</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
