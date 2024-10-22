"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import toast, { Toaster } from 'react-hot-toast';

interface SJASkjema {
  jobTitle: string;
  jobLocation: string;
  jobDate: string;
  participants: string;
  jobDescription: string;
  identifiedRisks: string;
  riskMitigation: string;
  responsiblePerson: string;
  comments: string;
}

export default function SJAForm() {
  const [form, setForm] = useState<SJASkjema>({
    jobTitle: "",
    jobLocation: "",
    jobDate: "",
    participants: "",
    jobDescription: "",
    identifiedRisks: "",
    riskMitigation: "",
    responsiblePerson: "",
    comments: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Sender inn SJA-skjema...');
    try {
      const response = await fetch("/api/sja/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
  
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Kunne ikke sende SJA-skjema");
      }
  
      toast.success('SJA-skjema er sendt inn!', {
        duration: 5000,
        icon: '✅',
      });
      setForm({
        jobTitle: "",
        jobLocation: "",
        jobDate: "",
        participants: "",
        jobDescription: "",
        identifiedRisks: "",
        riskMitigation: "",
        responsiblePerson: "",
        comments: "",
      });
    } catch (error: any) {
      console.error("Feil ved innsending av SJA-skjema:", error);
      toast.error(`Feil ved innsending: ${error.message}`, {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sikker Jobb Analyse (SJA) Skjema</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Jobbinformasjon */}
          <div>
            <Label htmlFor="jobTitle">Jobbtittel</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="jobLocation">Jobbplassering</Label>
            <Input
              id="jobLocation"
              name="jobLocation"
              value={form.jobLocation}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="jobDate">Dato for jobben</Label>
            <Input
              id="jobDate"
              name="jobDate"
              type="date"
              value={form.jobDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="participants">Deltakere</Label>
            <Textarea
              id="participants"
              name="participants"
              value={form.participants}
              onChange={handleChange}
              required
            />
          </div>

          {/* Jobbbeskrivelse og risikoanalyse */}
          <div>
            <Label htmlFor="jobDescription">Beskrivelse av jobben</Label>
            <Textarea
              id="jobDescription"
              name="jobDescription"
              value={form.jobDescription}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="identifiedRisks">Identifiserte risikoer</Label>
            <Textarea
              id="identifiedRisks"
              name="identifiedRisks"
              value={form.identifiedRisks}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="riskMitigation">Tiltak for å redusere risiko</Label>
            <Textarea
              id="riskMitigation"
              name="riskMitigation"
              value={form.riskMitigation}
              onChange={handleChange}
              required
            />
          </div>

          {/* Ansvarlig og godkjenning */}
          <div>
            <Label htmlFor="responsiblePerson">Ansvarlig person</Label>
            <Input
              id="responsiblePerson"
              name="responsiblePerson"
              value={form.responsiblePerson}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="approvalDate">Dato for godkjenning</Label>
            <Input
              id="approvalDate"
              name="approvalDate"
              type="date"
              value={form.approvalDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* Kommentarer */}
          <div>
            <Label htmlFor="comments">Kommentarer</Label>
            <Textarea
              id="comments"
              name="comments"
              value={form.comments}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full bg-black text-white hover:bg-pink-500">
            Send skjema
          </Button>
        </form>
        <Toaster position="top-center" reverseOrder={false} />
        {/* {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-500 mt-4">{success}</p>} */}
      </CardContent>
    </Card>
  );
}