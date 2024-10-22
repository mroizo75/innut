"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Edit2, Trash2, CheckCircle, RefreshCw, Play, FileText } from "lucide-react";
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { ProsjektStatus } from "@prisma/client";
import React from 'react';
import { OppgaveStatus, oppgaveStatusTilTekst } from "@/utils/status-mapper";

interface Prosjekt {
  id: string;
  navn: string;
  startDato: Date;
  sluttDato: Date;
  beskrivelse: string;
  status: ProsjektStatus;
  oppgaveTelling: {
    total: number;
    ikke_startet: number;
    i_gang: number;
    fullfort: number;
  };
}

interface ProsjektListeProps {
  prosjekter: Prosjekt[];
  currentUser: any;
}

const ProsjektListe = ({ prosjekter, currentUser }: ProsjektListeProps) => {
  const router = useRouter();

  // Funksjon for å markere et prosjekt som fullført
  const fullførProsjekt = async (prosjektId: string) => {
    try {
      await fetch(`/api/prosjekt/fullfor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prosjektId }),
      });
      router.refresh();
    } catch (error) {
      console.error("Feil ved fullføring av prosjekt:", error);
    }
  };

  // Funksjon for å slette et prosjekt
  const slettProsjekt = async (prosjektId: string) => {
    if (confirm("Er du sikker på at du vil slette dette prosjektet?")) {
      try {
        await fetch(`/api/prosjekt/slett`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prosjektId }),
        });
        router.refresh();
      } catch (error) {
        console.error("Feil ved sletting av prosjekt:", error);
      }
    }
  };

  const settProsjektStatus = async (prosjektId: string, nyStatus: string) => {
    try {
      await fetch(`/api/prosjekt/sett-status/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prosjektId, status: nyStatus }),
      });
      router.refresh();
    } catch (error) {
      console.error("Feil ved oppdatering av prosjektstatus:", error);
    }
  };

  const oppdaterProsjektStatus = async () => {
    try {
      await fetch('/api/prosjektstatus');
      router.refresh();
    } catch (error) {
      console.error("Feil ved oppdatering av prosjektstatus:", error);
    }
  };
  React.useEffect(() => {
    oppdaterProsjektStatus();
  }, []);

  const redigerProsjekt = (prosjektId: string) => {
    router.push(`/prosjekter/rediger/${prosjektId}`);
  };

  const genererRapport = async (prosjektId: string) => {
    try {
      const res = await fetch(`/api/prosjekt/${prosjektId}/generer-rapport`);
      if (!res.ok) {
        throw new Error('Feil ved generering av rapport');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prosjektrapport_${prosjektId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Feil ved generering av rapport:', error);
      alert('Det oppstod en feil ved generering av rapporten.');
    }
  };

  return (
    <>
      {/* Planlagte prosjekter */}
      <h2 className="text-2xl font-bold mb-6">Planlagte Prosjekter</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prosjekter.map((prosjekt) => (
          <div key={prosjekt.id} className="border p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2">{prosjekt.navn}</h2>
            <p className="text-gray-600">
              {prosjekt.beskrivelse || "Ingen beskrivelse tilgjengelig."}
            </p>
            <p className="text-sm text-gray-500">
              Startdato: {format(prosjekt.startDato, "dd.MM.yyyy", { locale: nb })}
            </p>
            <p className="text-sm text-gray-500">
              Sluttdato: {format(prosjekt.sluttDato, 'dd.MM.yyyy', { locale: nb })}
            </p>
            <div className="flex items-center mt-2 space-x-2">
              {/* Legg til knapper for redigering og sletting om nødvendig */}
              <button onClick={() => settProsjektStatus(prosjekt.id, "STARTET")} title="Start prosjektet">
                  <Play className="h-5 w-5 text-green-500" />
                </button>
                <button onClick={() => settProsjektStatus(prosjekt.id, "AVSLUTTET")} title="Fullfør prosjektet">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </button>
                <button onClick={() => redigerProsjekt(prosjekt.id)} title="Rediger prosjektet">
                  <Edit2 className="h-5 w-5 text-gray-500" />
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Aktive prosjekter */}
      <h2 className="text-2xl font-bold mt-10 mb-6">Aktive Prosjekter</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prosjekter.map((prosjekt) => (
          <div key={prosjekt.id} className="border p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2">{prosjekt.navn}</h2>
            <p className="text-gray-600">
              {prosjekt.beskrivelse || "Ingen beskrivelse tilgjengelig."}
            </p>
            <p className="text-sm text-gray-500">
            Startdato:{format(prosjekt.startDato, "dd.MM.yyyy", { locale: nb })}
            </p>
            <p className="text-sm text-gray-500">
            Sluttdato: {format((prosjekt.sluttDato), 'dd.MM.yyyy', { locale: nb })}
            </p>
            {prosjekt.oppgaveTelling && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Oppgaver:</p>
                      <p>Totalt: {prosjekt.oppgaveTelling.total}</p>
                      <p>
                        Ikke startet: {prosjekt.oppgaveTelling.ikke_startet || 0}
                      </p>
                      <p>
                        I gang: {prosjekt.oppgaveTelling.i_gang || 0}
                      </p>
                      <p>
                        Fullført: {prosjekt.oppgaveTelling.fullfort || 0}
                      </p>
                    </div>
                  )}
            <div className="flex items-center mt-2 space-x-2">
            <Link href={`/kanban/${prosjekt.id}`} className="inline-flex items-center text-blue-500 hover:underline">
            Gå til prosjekt
            <Activity className="ml-1 h-4 w-4" />
          </Link>
              <button
                onClick={() => router.push(`/prosjekter/rediger/${prosjekt.id}`)}
                className="text-yellow-500 hover:text-yellow-700"
                title="Rediger prosjektet"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => slettProsjekt(prosjekt.id)}
                className="text-red-500 hover:text-red-700"
                title="Slett prosjektet"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => fullførProsjekt(prosjekt.id)}
                className="text-green-500 hover:text-green-700"
                title="Fullfør prosjektet"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fullførte prosjekter */}
      <h2 className="text-2xl font-bold mt-10 mb-6">Fullførte Prosjekter</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prosjekter.map((prosjekt) => (
          <div key={prosjekt.id} className="border p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2">{prosjekt.navn}</h2>
            <p className="text-gray-600">
              {prosjekt.beskrivelse || "Ingen beskrivelse tilgjengelig."}
            </p>
            <p className="text-sm text-gray-500">
              Startdato: {format(prosjekt.startDato, 'dd.MM.yyyy', { locale: nb })}
            </p>
            <p className="text-sm text-gray-500">
              Sluttdato: {format(prosjekt.sluttDato, 'dd.MM.yyyy', { locale: nb })}
            </p>
            {/* Handlinger for fullførte prosjekter */}
            <div className="flex items-center mt-2 space-x-2">
              <Link href={`/kanban/${prosjekt.id}`}>
                <span className="inline-flex items-center text-blue-500 hover:underline">
                  Vis prosjekt
                  <Activity className="ml-1 h-4 w-4" />
                </span>
              </Link>
              <button
              onClick={() => genererRapport(prosjekt.id)}
              className="text-green-500 hover:text-green-700"
              title="Generer rapport"
            >
              <FileText className="h-5 w-5" />
      </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProsjektListe;
