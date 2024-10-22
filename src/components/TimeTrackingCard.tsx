"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Edit2, Table, Trash2 } from "lucide-react"
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

interface Prosjekt {
  id: string
  navn: string
  status: string
}

interface Oppgave {
  id: string
  tittel: string
  prosjektId: string
  prosjekt: Prosjekt
}

interface TimeEntry {
  id: string
  date: string
  hours: number
  description?: string
  prosjektId: string
  oppgaveId?: string
  prosjekt?: Prosjekt
  oppgave?: Oppgave
}

interface User {
  id: string
  navn: string
  etternavn: string
  oppgaver: Oppgave[]
}


interface TimeTrackingCardProps {
  currentUser: User
}

export function TimeTrackingCard({ currentUser }: TimeTrackingCardProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [prosjekter, setProsjekter] = useState<Prosjekt[]>([])
  const [totalHoursThisMonth, setTotalHoursThisMonth] = useState<number>(0)
  const [totalHoursLastMonth, setTotalHoursLastMonth] = useState<number>(0)
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null)
  const [valgtProsjektId, setValgtProsjektId] = useState("")
  const [valgtOppgaveId, setValgtOppgaveId] = useState("")
  const [oppgaver, setOppgaver] = useState<Oppgave[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Hent unike prosjekter fra brukerens oppgaver
  useEffect(() => {
    if (currentUser && Array.isArray(currentUser.oppgaver)) {
      const unikeProsjekterMap = new Map<string, Prosjekt>()
  
      currentUser.oppgaver.forEach((oppgave) => {
        const prosjekt = oppgave.prosjekt
        if (
          prosjekt &&
          prosjekt.status !== 'AVSLUTTET' && // Ekskluder fullførte prosjekter
          !unikeProsjekterMap.has(prosjekt.id)
        ) {
          unikeProsjekterMap.set(prosjekt.id, prosjekt)
        }
      })
  
      setProsjekter(Array.from(unikeProsjekterMap.values()))
    } else {
      console.warn("currentUser.oppgaver er ikke tilgjengelig eller er ikke en liste.")
      setProsjekter([])
    }
  }, [currentUser])

   // Ny useEffect for å filtrere oppgaver basert på valgt prosjekt
   useEffect(() => {
    if (valgtProsjektId) {
      const filtrerteOppgaver = currentUser.oppgaver.filter(
        (oppgave) => oppgave.prosjektId === valgtProsjektId
      )
      setOppgaver(filtrerteOppgaver)
    } else {
      setOppgaver([])
    }
    setValgtOppgaveId("")
  }, [valgtProsjektId, currentUser])

  // Funksjon for å hente timeregistreringer
  async function fetchTimeEntries() {
    try {
      const res = await fetch("/api/time-entries")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data: TimeEntry[] = await res.json()
      console.log("Fetched time entries:", data)
      setTimeEntries(data)
    } catch (error) {
      console.error("Feil ved henting av timeregistreringer:", error)
      setError("Kunne ikke hente timeregistreringer. Prøv igjen senere.")
    }
  }

  // Hent data når komponenten mountes
  useEffect(() => {
    fetchTimeEntries()
  }, [])

  // Oppdater total timer for inneværende måned
  useEffect(() => {
    const now = new Date()

    // Beregn total timer for inneværende måned
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)

    const hoursThisMonth = timeEntries
      .filter((entry) =>
        isWithinInterval(new Date(entry.date), {
          start: currentMonthStart,
          end: currentMonthEnd,
        })
      )
      .reduce((total, entry) => total + entry.hours, 0)

    setTotalHoursThisMonth(hoursThisMonth)

    // Beregn total timer for forrige måned
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthStart = startOfMonth(lastMonthDate)
    const lastMonthEnd = endOfMonth(lastMonthDate)

    const hoursLastMonth = timeEntries
      .filter((entry) =>
        isWithinInterval(new Date(entry.date), {
          start: lastMonthStart,
          end: lastMonthEnd,
        })
      )
      .reduce((total, entry) => total + entry.hours, 0)

    setTotalHoursLastMonth(hoursLastMonth)
  }, [timeEntries])

  // Funksjoner for redigering og sletting
  const handleEdit = (entry: TimeEntry) => {
    setEditEntry(entry)
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/delete-time-entry/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      // Oppdater timeregistreringene etter sletting
      fetchTimeEntries()
    } catch (error) {
      console.error("Feil ved sletting av timeregistrering:", error)
    }
  }

  // Funksjon for å håndtere innsending av skjemaet
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
  
    const formData = new FormData(event.currentTarget)
    const data = {
      date: formData.get('date'),
      hours: parseFloat(formData.get('hours') as string),
      description: formData.get('description'),
      prosjektId: valgtProsjektId,
      oppgaveId: valgtOppgaveId || null
    }
  
    const method = editEntry ? 'PUT' : 'POST'
    const url = editEntry 
      ? `/api/add-time-entry/${editEntry.id}` 
      : '/api/add-time-entry'
  
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      const newEntry = await response.json()
      setTimeEntries(prevEntries => {
        if (editEntry) {
          return prevEntries.map(entry => entry.id === newEntry.id ? newEntry : entry)
        } else {
          return [...prevEntries, newEntry]
        }
      })
      setIsOpen(false)
      setEditEntry(null)
      fetchTimeEntries()
    } catch (error) {
      console.error('Feil ved lagring av timeregistrering:', error)
    }
  }

  useEffect(() => {
    if (editEntry) {
      setValgtProsjektId(editEntry.prosjektId)
      setValgtOppgaveId(editEntry.oppgaveId || '')
    } else {
      setValgtProsjektId('')
    }
  }, [editEntry])

  return (
    <div className="flex flex-col">
      <Card>
        <CardHeader>
          <CardTitle>
            Timeregistrering for {currentUser.navn} {currentUser.etternavn}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Container for kortene og knappen */}
          <div className="flex flex-col md:flex-row items-center mb-2">
            {/* Kort for denne måneden */}
            <Card className="w-full m-2 shadow-md">
              <CardHeader>
                <CardTitle>Totale timer denne måneden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalHoursThisMonth.toFixed(1)} timer
                </div>
              </CardContent>
            </Card>

            {/* Kort for forrige måned */}
            <Card className="w-full m-2 shadow-md">
              <CardHeader>
                <CardTitle>Totale timer forrige måned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {totalHoursLastMonth.toFixed(1)} timer
                </div>
              </CardContent>
            </Card>

            {/* Legg til timer knapp */}
            <Button size="lg" onClick={() => { setEditEntry(null); setIsOpen(true) }} className="w-1/3 m-2 shadow-md">
              Legg til timer
            </Button>
          </div>

          {/* Tabell med timeregistreringer */}
          {timeEntries.length > 0 ? (
            <table className="table-fixed w-full">
              <thead >
                <tr className="text-center">
                  <th className="border px-2 py-1">Dato</th>
                  <th className="border px-2 py-1">Timer</th>
                  <th className="border px-2 py-1">Prosjekt</th>
                  <th className="border px-2 py-1">Oppgave</th>
                  <th className="border px-2 py-1 overflow-x-hidden">Beskrivelse</th>
                  <th className="border px-2 py-1 overflow-x-hidden">Handlinger</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {timeEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="border px-2 py-1 overflow-x-hidden">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="border px-2 py-1">{entry.hours}</td>
                    <td className="border px-2 py-1">
                      {entry.prosjekt?.navn || "Ukjent prosjekt"}
                    </td>
                    <td className="border px-2 py-1">
                      {entry.oppgave?.tittel || "Ingen oppgave"}
                    </td>
                    <td className="border px-2 py-1">{entry.description || ""}</td>
                    <td className="border px-2 py-1">
                      <button onClick={() => handleEdit(entry)}>
                        <Edit2 className="h-4 w-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4 inline text-red-500 ml-2" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Ingen timeregistreringer funnet.</p>
          )}
        </CardContent>
      </Card>

      {/* Modal for å legge til og redigere timer */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editEntry ? "Rediger timer" : "Legg til timer"}</DialogTitle>
            <DialogDescription>
              Fyll ut informasjonen nedenfor for {editEntry ? "å oppdatere" : "å legge til"} timeregistreringen.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input
                type="date"
                name="date"
                required
                defaultValue={editEntry ? new Date(editEntry.date).toISOString().split("T")[0] : ""}
                className="input"
              />
              <input
                type="number"
                step="0.5"
                name="hours"
                placeholder="Antall timer"
                required
                defaultValue={editEntry ? editEntry.hours.toString() : ""}
                className="input"
              />
              {prosjekter.length > 0 ? (
                <select
                  name="prosjektId"
                  value={valgtProsjektId}
                  onChange={(e) => setValgtProsjektId(e.target.value)}
                  required
                >
                  <option value="">Velg et prosjekt</option>
                  {prosjekter.map((prosjekt) => (
                    <option key={prosjekt.id} value={prosjekt.id}>
                      {prosjekt.navn}
                    </option>
                  ))}
                </select>
              ) : (
                <p>Ingen prosjekter tilgjengelig.</p>
              )}
              {oppgaver.length > 0 && (
                <select
                  name="oppgaveId"
                  value={valgtOppgaveId}
                  onChange={(e) => setValgtOppgaveId(e.target.value)}
                >
                  <option value="">Velg en oppgave (valgfritt)</option>
                  {oppgaver.map((oppgave) => (
                    <option key={oppgave.id} value={oppgave.id}>
                      {oppgave.tittel}
                    </option>
                  ))}
                </select>
              )}
              <Textarea
                name="description"
                placeholder="Beskrivelse (valgfritt)"
                defaultValue={editEntry ? editEntry.description : ""}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit">{editEntry ? "Oppdater" : "Registrer"} timer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}