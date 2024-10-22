"use client";
import React, { useState } from "react";
import axios from "axios";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface Kommentar {
  id: string;
  innhold: string;
  opprettetAt: string;
  bruker: {
    id: string;
    navn: string;
    bildeUrl: string;
  };
}

interface KommentarSectionProps {
  oppgaveId: string;
  initialComments: Kommentar[];
  currentUser: any;
}

export function KommentarSection({
  oppgaveId,
  initialComments,
  currentUser,
}: KommentarSectionProps) {
  const [kommentarer, setKommentarer] = useState(initialComments);
  const [nyKommentar, setNyKommentar] = useState("");

  const leggTilKommentar = async () => {
    if (nyKommentar.trim() === "") return;

    try {
      const response = await axios.post("/api/legg-til-kommentar", {
        oppgaveId,
        brukerId: currentUser.id,
        innhold: nyKommentar,
      });
      setKommentarer([...kommentarer, response.data]);
      setNyKommentar("");
    } catch (error) {
      console.error("Feil ved lagring av kommentar:", error);
    }
  };

  return (
    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
      <h4 className="font-medium mb-2">Kommentarer</h4>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {kommentarer.map((kommentar) => (
          <div key={kommentar.id} className="flex items-start space-x-2">
            <Avatar>
              <AvatarImage src={kommentar.bruker.bildeUrl} />
              <AvatarFallback>
                {kommentar.bruker.navn.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 p-2 rounded-lg flex-1">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">
                  {kommentar.bruker.navn}
                </p>
                <p className="text-xs text-gray-500">
                  {format(
                    new Date(kommentar.opprettetAt),
                    "dd.MM.yyyy HH:mm"
                  )}
                </p>
              </div>
              <p className="text-sm">{kommentar.innhold}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center space-x-2">
        <Input
          value={nyKommentar}
          onChange={(e) => setNyKommentar(e.target.value)}
          placeholder="Skriv en kommentar..."
          className="flex-1"
        />
        <Button onClick={leggTilKommentar}>Send</Button>
      </div>
    </div>
  );
}