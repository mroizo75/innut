// src/components/RedigerProsjektForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Prosjekt {
  id: string;
  navn: string;
  beskrivelse: string;
  startDato: string;
  sluttDato: string;
}

interface RedigerProsjektFormProps {
  prosjekt: Prosjekt;
}

const RedigerProsjektForm = ({ prosjekt }: RedigerProsjektFormProps) => {
  const router = useRouter();

  const [navn, setNavn] = useState(prosjekt.navn);
  const [beskrivelse, setBeskrivelse] = useState(prosjekt.beskrivelse || "");
  const [startDato, setStartDato] = useState(prosjekt.startDato.split('T')[0]);
  const [sluttDato, setSluttDato] = useState(prosjekt.sluttDato.split('T')[0]);

  const oppdaterProsjekt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/prosjekt/oppdater`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prosjektId: prosjekt.id,
          navn,
          beskrivelse,
          startDato,
          sluttDato,
        }),
      });
      router.push("/prosjekter");
    } catch (error) {
      console.error("Feil ved oppdatering av prosjekt:", error);
    }
  };

  return (
    <form onSubmit={oppdaterProsjekt} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium">Navn</label>
        <input
          type="text"
          value={navn}
          onChange={(e) => setNavn(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Beskrivelse</label>
        <textarea
          value={beskrivelse}
          onChange={(e) => setBeskrivelse(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Startdato</label>
        <input
          type="date"
          value={startDato}
          onChange={(e) => setStartDato(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Sluttdato</label>
        <input
          type="date"
          value={sluttDato}
          onChange={(e) => setSluttDato(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">
        Oppdater Prosjekt
      </button>
    </form>
  );
};

export default RedigerProsjektForm;