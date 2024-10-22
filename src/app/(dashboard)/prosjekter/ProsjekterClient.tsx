"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Prosjekt, User } from "@prisma/client";
import { Edit, FileText, Trash2 } from "lucide-react";
import axios from "axios";
import { OppgaveStatus } from "@/utils/status-mapper";

interface ProsjektMedTelling extends Prosjekt {
  oppgaveTelling: {
    total: number;
    IKKE_STARTET: number;
    I_GANG: number;
    FULLFORT: number;
  };
}

interface ProsjekterClientProps {
  initialProsjekter: ProsjektMedTelling[];
  currentUser: User;
}

export function ProsjekterClient({ initialProsjekter, currentUser }: ProsjekterClientProps) {
  const router = useRouter();

  const slettProsjekt = async (prosjektId: string) => {
    if (confirm("Er du sikker på at du vil slette dette prosjektet?")) {
      try {
        await axios.post(`/api/prosjekt/slett`, { prosjektId });
        router.refresh(); // Oppdaterer siden for å reflektere endringer
      } catch (error) {
        console.error("Feil ved sletting av prosjekt:", error);
      }
    }
  };

  const genererSluttrapport = async (prosjektId: string) => {
    try {
      const res = await fetch(`/api/prosjekt/${prosjektId}/generer-sluttrapport`);
      if (!res.ok) {
        throw new Error('Feil ved generering av sluttrapport');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sluttrapport_${prosjektId}.pdf`); // Juster filtypen hvis nødvendig
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Feil ved generering av sluttrapport:', error);
      alert('Det oppstod en feil ved generering av sluttrapporten.');
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {initialProsjekter.map((prosjekt) => (
        <Card key={prosjekt.id} className="mb-4">
          <CardHeader>
            <CardTitle>{prosjekt.navn}</CardTitle>
            <CardDescription>{prosjekt.beskrivelse}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              {new Date(prosjekt.startDato).toLocaleDateString('nb-NO')} -{' '}
              {new Date(prosjekt.sluttDato).toLocaleDateString('nb-NO')}
            </p>
            {prosjekt.oppgaveTelling ? (
              <div className="mb-4">
                <p className="text-md font-bold">Oppgaver</p>
                <p className="text-sm">Totalt: {prosjekt.oppgaveTelling.total}</p>
                <p className="text-sm">
                  Ikke startet: {prosjekt.oppgaveTelling.IKKE_STARTET || 0}
                </p>
                <p className="text-sm">
                  I gang: {prosjekt.oppgaveTelling.I_GANG || 0}
                </p>
                <p className="text-sm">
                  Fullført: {prosjekt.oppgaveTelling.FULLFORT || 0}
                </p>
              </div>
            ) : (
              <p className="text-sm">Ingen oppgaver</p>
            )}
            <div className="flex flex-wrap space-x-1 gap-1">
              <Link href={`/prosjekter/${prosjekt.id}`}>
                <Button variant="outline">Detaljer</Button>
              </Link>
              {(currentUser.role === "ADMIN" ||
                currentUser.role === "LEDER" ||
                currentUser.role === "PROSJEKTLEDER") && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/prosjekter/rediger/${prosjekt.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => slettProsjekt(prosjekt.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => genererSluttrapport(prosjekt.id)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
