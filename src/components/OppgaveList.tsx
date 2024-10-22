"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Oppgave, OppgaveStatus, Prioritet } from "@prisma/client"
import { leggTilOppgave, redigerOppgave, registrerTid } from "@/actions/oppgave"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OppgaveListProps {
  oppgaver: Oppgave[]
  userId: string
  prosjektId: string
}

const OppgaveList = ({ oppgaver, userId, prosjektId }: OppgaveListProps) => {
  const [localOppgaver, setLocalOppgaver] = useState<Oppgave[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [redigeringOppgave, setRedigeringOppgave] = useState<Oppgave | null>(null)
  const [tidRegistrering, setTidRegistrering] = useState({ oppgaveId: "", tid: 0 });

  useEffect(() => {
    setLocalOppgaver(oppgaver)
  }, [oppgaver])

  const handleOpprettOppgave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nyOppgave = await leggTilOppgave({
      tittel: formData.get('tittel') as string,
      beskrivelse: formData.get('beskrivelse') as string,
      startDato: new Date(formData.get('startDato') as string),
      sluttDato: new Date(formData.get('sluttDato') as string),
      status: formData.get('status') as OppgaveStatus,
      prioritet: formData.get('prioritet') as Prioritet,
      brukerId: userId,
      prosjektId: prosjektId,
    })
    setLocalOppgaver([...localOppgaver, nyOppgave])
    setIsDialogOpen(false)
  }


  const handleRedigerOppgave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!redigeringOppgave) return
    const formData = new FormData(event.currentTarget)
    const oppdatertOppgave = await redigerOppgave(redigeringOppgave.id, {
      tittel: formData.get('tittel') as string,
      beskrivelse: formData.get('beskrivelse') as string,
      startDato: new Date(formData.get('startDato') as string),
      sluttDato: new Date(formData.get('sluttDato') as string),
      status: formData.get('status') as OppgaveStatus,
      prioritet: formData.get('prioritet') as Prioritet,
    })
    setLocalOppgaver(localOppgaver.map(o => o.id === oppdatertOppgave.id ? oppdatertOppgave : o))
    setRedigeringOppgave(null)
    setIsDialogOpen(false)
  }

  const handleRegistrerTid = async () => {
    if (tidRegistrering.oppgaveId && tidRegistrering.tid > 0) {
      await registrerTid(tidRegistrering.oppgaveId, tidRegistrering.tid);
      setTidRegistrering({ oppgaveId: "", tid: 0 });
      // Oppdater localOppgaver her hvis nødvendig
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dine oppgaver</CardTitle>
        <Button onClick={() => setIsDialogOpen(true)}>Ny oppgave</Button>
      </CardHeader>
      <CardContent>
        <div>
          {localOppgaver.map((oppgave) => (
            <div key={oppgave.id} className="mb-4">
              <Link href={`/oppgaver/${oppgave.id}`}>
                  {oppgave.tittel}
              </Link>
              <p>{oppgave.beskrivelse}</p>
              <Button onClick={() => {
                setRedigeringOppgave(oppgave)
                setIsDialogOpen(true)
              }}>
                Rediger
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{redigeringOppgave ? 'Rediger oppgave' : 'Ny oppgave'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={redigeringOppgave ? handleRedigerOppgave : handleOpprettOppgave}>
            <Input name="tittel" placeholder="Tittel" defaultValue={redigeringOppgave?.tittel} />
            <Textarea name="beskrivelse" placeholder="Beskrivelse" defaultValue={redigeringOppgave?.beskrivelse} />
            <Input name="startDato" type="date" defaultValue={redigeringOppgave?.startDato.toISOString().split('T')[0]} />
            <Input name="sluttDato" type="date" defaultValue={redigeringOppgave?.sluttDato.toISOString().split('T')[0]} />
            <Select name="status" defaultValue={redigeringOppgave?.status || OppgaveStatus.IKKE_STARTET}>
              <SelectTrigger>
                <SelectValue placeholder="Velg status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OppgaveStatus).map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="prioritet" defaultValue={redigeringOppgave?.prioritet || Prioritet.MEDIUM}>
              <SelectTrigger>
                <SelectValue placeholder="Velg prioritet" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Prioritet).map((prioritet) => (
                  <SelectItem key={prioritet} value={prioritet}>{prioritet}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              name="estimertTid" 
              type="number" 
              placeholder="Estimert tid (timer)" 
              defaultValue={redigeringOppgave?.estimertTid || 0} 
            />
            <Button type="submit">{redigeringOppgave ? 'Oppdater' : 'Opprett'}</Button>
          </form>
        </DialogContent>
      </Dialog>
      <div>
        <h3>Registrer tid på oppgave</h3>
        <Select 
          value={tidRegistrering.oppgaveId} 
          onValueChange={(value) => setTidRegistrering(prev => ({ ...prev, oppgaveId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Velg oppgave" />
          </SelectTrigger>
          <SelectContent>
            {localOppgaver.map((oppgave) => (
              <SelectItem key={oppgave.id} value={oppgave.id}>{oppgave.tittel}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input 
          type="number" 
          placeholder="Antall timer" 
          value={tidRegistrering.tid} 
          onChange={(e) => setTidRegistrering(prev => ({ ...prev, tid: Number(e.target.value) }))}
        />
        <Button onClick={handleRegistrerTid}>Registrer tid</Button>
      </div>
    </Card>
  )
}

export default OppgaveList