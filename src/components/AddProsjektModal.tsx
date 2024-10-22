"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AddProsjektModalProps {
  currentUser: {
    id: string;
    bedriftId: string;
  };
  addProsjektAction: (formData: FormData) => Promise<void>;
}

  export function AddProsjektModal({ currentUser, addProsjektAction }: AddProsjektModalProps) {
    const [isOpen, setIsOpen] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      formData.append('bedriftId', currentUser.bedriftId);
      try {
        await addProsjektAction(formData);
        setIsOpen(false);
      } catch (error) {
        console.error('Feil ved opprettelse av prosjekt:', error);
        // Her kan du legge til en feilmelding til brukeren, f.eks. ved å bruke en state variabel
      }
    };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Legg til nytt prosjekt</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legg til nytt prosjekt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="navn" placeholder="Prosjektnavn" required />
          <Input name="startDato" type="date" required />
          <Input name="sluttDato" type="date" required />
          <Input name="beskrivelse" placeholder="Beskrivelse" required />
          <select name="status" className="w-full p-2 border rounded">
            <option value="">Automatisk status</option>
            <option value="IKKE_STARTET">Ikke startet</option>
            <option value="STARTET">Startet</option>
            <option value="AVSLUTTET">Avsluttet</option>
          </select>
          <Button type="submit">Legg til prosjekt</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

