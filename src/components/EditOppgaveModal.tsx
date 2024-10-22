"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface EditOppgaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  oppgave: {
    id: string;
    tittel: string;
    beskrivelse: string;
    startDato: Date | null;
    sluttDato: Date | null;
    brukerId: string;
    status: string;
    estimertTid: number;
  };
  onEdit: (oppgave: {
    id: string;
    tittel: string;
    beskrivelse: string;
    startDato: Date | null;
    sluttDato: Date | null;
    brukerId: string;
    status: string;
    estimertTid: number;
  }) => void;
  currentUser: any;
}

export function EditOppgaveModal({ isOpen, onClose, oppgave, onEdit, currentUser }: EditOppgaveModalProps) {
  const [formData, setFormData] = useState({
    tittel: oppgave?.tittel || '',
    beskrivelse: oppgave?.beskrivelse || '',
    startDato: oppgave?.startDato ? oppgave.startDato.toISOString().slice(0, 10) : '',
    sluttDato: oppgave?.sluttDato ? oppgave.sluttDato.toISOString().slice(0, 10) : '',
    brukerId: oppgave?.brukerId || '',
    status: oppgave?.status || 'IKKE_STARTET',
    estimertTid: oppgave?.estimertTid?.toString() || '0',
  });

  useEffect(() => {
    if (oppgave) {
      setFormData({
        tittel: oppgave.tittel,
        beskrivelse: oppgave.beskrivelse || '',
        startDato: oppgave.startDato ? oppgave.startDato.toISOString().slice(0, 10) : '',
        sluttDato: oppgave.sluttDato ? oppgave.sluttDato.toISOString().slice(0, 10) : '',
        brukerId: oppgave.brukerId || '',
        status: oppgave.status || 'IKKE_STARTET',
        estimertTid: oppgave.estimertTid?.toString() || '0',
      });
    }
  }, [oppgave]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const oppdatertOppgave = {
      id: oppgave.id,
      tittel: formData.tittel,
      beskrivelse: formData.beskrivelse,
      startDato: formData.startDato ? new Date(formData.startDato) : null,
      sluttDato: formData.sluttDato ? new Date(formData.sluttDato) : null,
      status: formData.status,
      estimertTid: parseFloat(formData.estimertTid) || 0,
      brukerId: formData.brukerId,
      // Legg til andre nødvendige felter
    };

    await onEdit(oppdatertOppgave);
  };

  // Håndter input-endringer
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger oppgave</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="tittel"
            value={formData.tittel}
            onChange={handleChange}
            placeholder="Oppgavetittel"
            required
          />
          <Textarea
            name="beskrivelse"
            value={formData.beskrivelse}
            onChange={handleChange}
            placeholder="Beskrivelse"
          />
          <Input
            name="startDato"
            type="date"
            value={formData.startDato}
            onChange={handleChange}
            required
          />
          <Input
            name="sluttDato"
            type="date"
            value={formData.sluttDato}
            onChange={handleChange}
            required
          />
          <div>
            <label htmlFor="estimertTid">Estimert tid</label>
            <Input
              name="estimertTid"
            type="number"
            placeholder="Estimert tid"
            value={formData.estimertTid}
            onChange={handleChange}
            required
          />
          </div>
          <div>
            <label htmlFor="status">Status</label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IKKE_STARTET">Ikke startet</SelectItem>
                <SelectItem value="I_GANG">I gang</SelectItem>
                <SelectItem value="FERDIG">Ferdig</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Legg til valg av bruker hvis nødvendig */}
          <Button type="submit">Lagre endringer</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
