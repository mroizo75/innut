"use client"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import toast, { Toaster } from 'react-hot-toast';
import { Prosjekt } from "@prisma/client";


export default function AvviksSkjema() {
  const router = useRouter();
  const [form, setForm] = useState({
    tittel: "",
    prosjektId: "",
    innhold: {
      responsible: "",
      discoveredBy: "",
      date: "",
      place: "",
      occurredBefore: false,
      consequence: {
        person: false,
        equipment: false,
        environment: false,
        other: false,
        otherDescription: "",
      },
      description: "",
      shortTermCorrection: "",
      longTermCorrection: "",
    }
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [prosjekter, setProsjekter] = useState<Prosjekt[]>([]);
  const [avviksnummer, setAvviksnummer] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProsjekter() {
      try {
        const response = await fetch('/api/prosjekter');
        if (response.ok) {
          const data = await response.json();
          setProsjekter(data);
        } else {
          console.error('Feil ved henting av prosjekter');
        }
      } catch (error) {
        console.error('Feil ved henting av prosjekter:', error);
      }
    }
    fetchProsjekter();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === "tittel") {
      setForm(prevForm => ({
        ...prevForm,
        tittel: value
      }));
    } else {
      setForm(prevForm => ({
        ...prevForm,
        innhold: {
          ...prevForm.innhold,
          [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }
      }));
    }
  };

  const handleConsequenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      innhold: {
        ...prevForm.innhold,
        consequence: {
          ...prevForm.innhold.consequence,
          [name]: checked,
        },
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Sender inn avviksskjema...');
    try {
      const response = await fetch("/api/submit-avvik", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tittel: form.tittel,
          innhold: form.innhold,
          prosjektId: form.prosjektId,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        toast.success('Avviksskjema er sendt inn!', {
          id: loadingToast,
          duration: 5000,
          icon: '✅',
        });
        // Sett avviksnummeret
        setAvviksnummer(result.avviksnummer);
        // Nullstill skjemaet
        setForm({
          tittel: "",
          prosjektId: "",
          innhold: {
            responsible: "",
            discoveredBy: "",
            date: "",
            place: "",
            occurredBefore: false,
            consequence: {
              person: false,
              equipment: false,
              environment: false,
              other: false,
              otherDescription: "",
            },
            description: "",
            shortTermCorrection: "",
            longTermCorrection: "",
          }
        });
      } else {
        const result = await response.json();
        throw new Error(result.error || "Ukjent feil");
      }
    } catch (error: any) {
      toast.error(`Feil ved innsending: ${error.message}`, {
        id: loadingToast,
        duration: 5000,
        icon: '❌',
      });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Nytt Avvik</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tittel">Tittel</Label>
                <Input
                  id="tittel"
                  name="tittel"
                  value={form.tittel}
                  onChange={handleChange}
                  placeholder="Skriv inn tittelen på avviket"
                  required
                />
              </div>
              <div>
                <Label htmlFor="prosjektId">Prosjekt</Label>
                <Select
                  onValueChange={(value) =>
                    setForm((prevForm) => ({
                      ...prevForm,
                      prosjektId: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Velg et prosjekt" />
                  </SelectTrigger>
                  <SelectContent>
                    {prosjekter.map((prosjekt) => (
                      <SelectItem key={prosjekt.id} value={prosjekt.id}>
                        {prosjekt.navn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="responsible">Ansvarlig person</Label>
                <Input
                  id="responsible"
                  name="responsible"
                  value={form.innhold.responsible}
                  onChange={handleChange}
                  placeholder="Ansvarlig person"
                  required
                />
              </div>
              <div>
                <Label htmlFor="discoveredBy">Oppdaget av</Label>
                <Input
                  id="discoveredBy"
                  name="discoveredBy"
                  value={form.innhold.discoveredBy}
                  onChange={handleChange}
                  placeholder="Hvem oppdaget avviket"
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Dato</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={form.innhold.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="place">Sted</Label>
                <Input
                  id="place"
                  name="place"
                  value={form.innhold.place}
                  onChange={handleChange}
                  placeholder="Hvor skjedde avviket"
                  required
                />
              </div>
            </div>
    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Hendt tidligere</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="occurredBeforeYes"
                      name="occurredBefore"
                      checked={form.innhold.occurredBefore}
                      onCheckedChange={(checked) => 
                        setForm(prevForm => ({
                          ...prevForm,
                          innhold: {
                            ...prevForm.innhold,
                            occurredBefore: checked as boolean
                          } 
                        }))
                      }
                    />
                    <Label htmlFor="occurredBeforeYes" className="ml-2">Ja</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="occurredBeforeNo"
                      name="occurredBefore"
                      checked={!form.innhold.occurredBefore}
                      onCheckedChange={(checked) => 
                        setForm(prevForm => ({
                          ...prevForm,
                          innhold: {
                            ...prevForm.innhold,
                            occurredBefore: !(checked as boolean)
                          } 
                        }))
                      }
                    />
                    <Label htmlFor="occurredBeforeNo" className="ml-2">Nei</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label>Konsekvens</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Person', 'Utstyr', 'Miljø', 'Annet'].map((key) => (
                    <div key={key.toLowerCase()} className="flex items-center">
                      <Checkbox
                        id={`consequence-${key.toLowerCase()}`}
                        name={key.toLowerCase()}
                        checked={form.innhold.consequence[key.toLowerCase() as keyof typeof form.innhold.consequence]}
                        onCheckedChange={(checked) => handleConsequenceChange({ target: { name: key.toLowerCase(), checked: checked as boolean } } as React.ChangeEvent<HTMLInputElement>)}
                      />
                      <Label htmlFor={`consequence-${key.toLowerCase()}`} className="ml-2">{key}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
    
            {form.innhold.consequence.annet && (
              <div>
                <Label htmlFor="otherDescription">Beskriv annet</Label>
                <Input
                  id="otherDescription"
                  name="otherDescription"
                  value={form.innhold.consequence.otherDescription}
                  onChange={(e) => setForm(prevForm => ({
                    ...prevForm,
                    innhold: {
                      ...prevForm.innhold,
                      consequence: {
                        ...prevForm.innhold.consequence,
                        otherDescription: e.target.value,
                      },
                    },
                  }))}
                  placeholder="Beskriv annet"
                />
              </div>
            )}
    
            <div>
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                name="description"
                value={form.innhold.description}
                onChange={handleChange}
                placeholder="Beskrivelse av avviket"
                required
                className="min-h-[100px]"
              />
            </div>
    
            <Button type="submit" className="w-full bg-black text-white hover:bg-pink-500">
              Send inn avvik
            </Button>
          </form>
        </CardContent>
      </Card>
      {avviksnummer && (
        <div className="mt-4 p-4 bg-green-100 text-green-800">
          <p>Avviket er registrert med avviksnummer: <strong>{avviksnummer}</strong></p>
        </div>
      )}
    </>
  );
}
