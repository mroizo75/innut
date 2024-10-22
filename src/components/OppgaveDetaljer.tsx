"use client"

import { useState } from 'react'
import { Oppgave, User, Kommentar, Fil, OppgaveStatus } from '@prisma/client'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface OppgaveDetaljerProps {
  oppgave: Oppgave & {
    kommentarer: (Kommentar & { bruker: User })[],
    filer: Fil[],
    bruker: User,
    prosjekt: any
  }
  currentUser: User
}

const OppgaveDetaljer: React.FC<OppgaveDetaljerProps> = ({ oppgave, currentUser }) => {
  const [status, setStatus] = useState<OppgaveStatus>(oppgave.status as OppgaveStatus)
  const [nyKommentar, setNyKommentar] = useState('')
  const [kommentarer, setKommentarer] = useState(oppgave.kommentarer)
  const [filer, setFiler] = useState<FileList | null>(null)
  const [oppgaveFiler, setOppgaveFiler] = useState(oppgave.filer)

  const oppdaterStatus = async (nyStatus: string) => {
    try {
      await fetch(`/api/oppgaver/${oppgave.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nyStatus })
      })
      setStatus(nyStatus as OppgaveStatus)
    } catch (error) {
      console.error('Kunne ikke oppdatere status:', error)
    }
  }

  const leggTilKommentar = async () => {
    if (nyKommentar.trim() === '') return
    try {
      const res = await fetch(`/api/oppgaver/${oppgave.id}/kommentarer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ innhold: nyKommentar })
      })
      const kommentar = await res.json()
      setKommentarer([kommentar, ...kommentarer])
      setNyKommentar('')
    } catch (error) {
      console.error('Kunne ikke legge til kommentar:', error)
    }
  }

  const lastOppFiler = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!filer || filer.length === 0) return

    const formData = new FormData()
    Array.from(filer).forEach((file) => {
      formData.append('files', file)
    })

    try {
      const res = await fetch(`/api/oppgaver/${oppgave.id}/filer`, {
        method: 'POST',
        body: formData
      })
      const nyeFiler = await res.json()
      setOppgaveFiler([...oppgaveFiler, ...nyeFiler])
      setFiler(null)
    } catch (error) {
      console.error('Kunne ikke laste opp filer:', error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{oppgave.tittel}</h1>
      <p className="text-gray-600 mb-4">{oppgave.beskrivelse}</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Status:</Label>
          <Select value={status} onValueChange={(val) => oppdaterStatus(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Velg status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IKKE_STARTET">Ikke Startet</SelectItem>
              <SelectItem value="I_GANG">I Gang</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="FULLFORT">Fullført</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="font-semibold">Prioritet:</p>
          <p>{oppgave.prioritet}</p>
        </div>
        <div>
          <p className="font-semibold">Startdato:</p>
          <p>{format(new Date(oppgave.startDato), 'dd.MM.yyyy', { locale: nb })}</p>
        </div>
        <div>
          <p className="font-semibold">Sluttdato:</p>
          <p>{format(new Date(oppgave.sluttDato), 'dd.MM.yyyy', { locale: nb })}</p>
        </div>
        <div>
          <p className="font-semibold">Prosjekt:</p>
          <p>{oppgave.prosjekt.navn}</p>
        </div>
        <div>
          <p className="font-semibold">Ansvarlig:</p>
          <p>{oppgave.bruker.navn} {oppgave.bruker.etternavn}</p>
        </div>
      </div>

      {/* Filopplasting */}
      <form onSubmit={lastOppFiler} className="mb-4">
        <Label className="block mb-2">Last opp filer:</Label>
        <Input type="file" multiple onChange={(e) => setFiler(e.target.files)} className="mb-2" />
        <Button type="submit">Last opp</Button>
      </form>

      {/* Viser filer */}
      {oppgaveFiler.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mt-4 mb-2">Vedlegg</h3>
          <ul>
            {oppgaveFiler.map((fil) => (
              <li key={fil.id}>
                <a href={fil.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {fil.navn}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Kommentarer */}
      <h3 className="text-lg font-semibold mt-4 mb-2">Kommentarer</h3>
      <div className="mb-4">
        <Textarea
          placeholder="Legg til en kommentar..."
          value={nyKommentar}
          onChange={(e) => setNyKommentar(e.target.value)}
        />
        <Button onClick={leggTilKommentar} className="mt-2">Legg til kommentar</Button>
      </div>
      {kommentarer.map((kommentar) => (
        <div key={kommentar.id} className="mb-2 p-2 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">
            {kommentar.bruker.navn} {kommentar.bruker.etternavn} - {format(new Date(kommentar.opprettetAt), 'dd.MM.yyyy HH:mm', { locale: nb })}
          </p>
          <p>{kommentar.innhold}</p>
        </div>
      ))}
    </div>
  )
}

export default OppgaveDetaljer