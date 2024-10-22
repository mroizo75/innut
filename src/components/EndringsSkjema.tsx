"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProjects, getLatestChangeNumber } from "@/actions/endringsSkjema";
import { toast, Toaster } from 'react-hot-toast';

interface ChangeRequestForm {
  projectId: string;
  projectName: string;
  changeNumber: string;
  description: string;
  submittedBy: string;
  implementationDate: string;
  followUpPerson: string;
  comments: string;
}

interface Project {
  id: string;
  navn: string;
}

export default function ChangeForm() {
  const [form, setForm] = useState<ChangeRequestForm>({
    projectId: "",
    projectName: "",
    changeNumber: "",
    description: "",
    submittedBy: "",
    implementationDate: "",
    followUpPerson: "",
    comments: "",
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProjects();
    fetchLatestChangeNumber();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Feil ved henting av prosjekter:", error);
      setError("Kunne ikke hente prosjekter");
    }
  };

  const fetchLatestChangeNumber = async () => {
    try {
      const response = await fetch("/api/change/generate-number");
      if (!response.ok) {
        throw new Error("Kunne ikke generere nytt endringsnummer");
      }
      const data = await response.json();
      setForm((prevForm) => ({ ...prevForm, changeNumber: data.changeNumber }));
    } catch (error) {
      console.error("Feil ved generering av endringsnummer:", error);
      setError("Kunne ikke generere endringsnummer");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    name?: string
  ) => {
    if (typeof e === "string") {
      if (name === "projectId") {
        const selectedProject = projects.find((p) => p.id === e);
        setForm((prevForm) => ({
          ...prevForm,
          projectId: e,
          projectName: selectedProject?.navn || "Ukjent prosjekt",
        }));
      } else {
        setForm((prevForm) => ({
          ...prevForm,
          [name as string]: e,
        }));
      }
    } else {
      const { name, value } = e.target;
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Sender inn endringsskjema...');
    try {
      const response = await fetch("/api/change/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        toast.success('Endringsskjema er sendt inn!', {
          duration: 5000,
          icon: '✅',
        });
        // Reset form here
        setForm({
          projectId: "",
          projectName: "",
          changeNumber: "",
          description: "",
          submittedBy: "",
          implementationDate: "",
          followUpPerson: "",
          comments: "",
        });
        // Hent nytt endringsnummer for neste skjema
        fetchLatestChangeNumber();
      } else {
        const result = await response.json();
        throw new Error(result.error || "Ukjent feil");
      }
    } catch (error: any) {
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
        <CardTitle>Endringsskjema</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="projectName">Prosjekt</Label>
            <Select onValueChange={(value) => handleChange(value, 'projectId')}>
              <SelectTrigger>
                <SelectValue placeholder="Velg prosjekt" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.navn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> 
          </div>
          <div>
            <Label htmlFor="changeNumber">Endringsnummer</Label>
            <Input
              id="changeNumber"
              name="changeNumber"
              value={form.changeNumber}
              readOnly
              disabled
              className="bg-gray-100"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Beskrivelse av endring</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="submittedBy">Initiert av</Label>
            <Input
              id="submittedBy"
              name="submittedBy"
              value={form.submittedBy}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="implementationDate">Dato for implementering av endring</Label>
            <Input
              id="implementationDate"
              name="implementationDate"
              type="date"
              value={form.implementationDate}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="comments">Kommentarer</Label>
            <Textarea
              id="comments"
              name="comments"
              value={form.comments}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" className="md:col-span-2 bg-black text-white hover:bg-pink-500">
            Send skjema
          </Button>
        </form>
        <Toaster position="top-right" />
        {/* {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-500 mt-4">{success}</p>} */}
      </CardContent>
    </Card>
  );
}