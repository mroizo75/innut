import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Oppgave, OppgaveStatus, Prioritet } from '@prisma/client'

interface OppgaveModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (oppgaveData: Partial<Oppgave>) => void
  oppgave: Oppgave | null
}

const OppgaveModal: React.FC<OppgaveModalProps> = ({ isOpen, onClose, onSave, oppgave }) => {
  const [tittel, setTittel] = useState('')
  const [beskrivelse, setBeskrivelse] = useState('')
  const [status, setStatus] = useState<OppgaveStatus>(OppgaveStatus.IKKE_STARTET)
  const [prioritet, setPrioritet] = useState<Prioritet>(Prioritet.MEDIUM)

  useEffect(() => {
    if (oppgave) {
      setTittel(oppgave.tittel)
      setBeskrivelse(oppgave.beskrivelse)
      setStatus(oppgave.status)
      setPrioritet(oppgave.prioritet)
    } else {
      setTittel('')
      setBeskrivelse('')
      setStatus(OppgaveStatus.IKKE_STARTET)
      setPrioritet(Prioritet.MEDIUM)
    }
  }, [oppgave])

  const handleSave = () => {
    onSave({ tittel, beskrivelse, status, prioritet })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{oppgave ? 'Rediger oppgave' : 'Legg til ny oppgave'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Tittel"
            value={tittel}
            onChange={(e) => setTittel(e.target.value)}
          />
          <Textarea
            placeholder="Beskrivelse"
            value={beskrivelse}
            onChange={(e) => setBeskrivelse(e.target.value)}
          />
          <Select value={status} onValueChange={(value) => setStatus(value as OppgaveStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Velg status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(OppgaveStatus).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={prioritet} onValueChange={(value) => setPrioritet(value as Prioritet)}>
            <SelectTrigger>
              <SelectValue placeholder="Velg prioritet" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Prioritet).map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSave}>Lagre</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OppgaveModal