"use client"

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import SignatureCanvas from 'react-signature-canvas';

interface RiskAssessmentForm {
  incident: string;
  riskLevel: string;
  description: string;
}

export default function RiskAssessmentForm() {
  const [form, setForm] = useState<RiskAssessmentForm>({
    incident: "",
    riskLevel: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSignature, setShowSignature] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSignature(true);
  };

  const handleSignatureComplete = async () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL();
      try {
        const response = await fetch("/api/risk-assessment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, signature: signatureData }),
        });

        if (!response.ok) {
          throw new Error("Kunne ikke sende risikovurdering");
        }

        setForm({
          incident: "",
          riskLevel: "",
          description: "",
        });
        setSuccess("Risikovurdering sendt!");
        setShowSignature(false);
        signatureRef.current.clear();
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risikovurdering</CardTitle>
      </CardHeader>
      <CardContent>
        {!showSignature ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="incident">Uønsket hendelse</Label>
              <Input
                id="incident"
                name="incident"
                value={form.incident}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risikonivå</Label>
              <Input
                id="riskLevel"
                name="riskLevel"
                value={form.riskLevel}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-pink-700 text-white hover:bg-pink-500">
              Gå til signering
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas border border-gray-300'
              }}
            />
            <div className="flex space-x-4">
              <Button onClick={handleSignatureComplete} className="bg-green-700 text-white hover:bg-green-500">
                Fullfør signering
              </Button>
              <Button onClick={handleClearSignature} className="bg-gray-500 text-white hover:bg-gray-400">
                Tøm signatur
              </Button>
            </div>
          </div>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-500 mt-4">{success}</p>}
      </CardContent>
    </Card>
  );
}