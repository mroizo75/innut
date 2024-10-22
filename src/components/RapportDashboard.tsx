"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Clock } from "lucide-react"

interface RapportDashboardProps {
  antallProsjekter: number
  totaleTimer: number
}

export function RapportDashboard({ antallProsjekter, totaleTimer }: RapportDashboardProps) {
  const genererProsjektRapport = async () => {
    // Logikk for å generere prosjektrapport
    const res = await fetch("/api/generer-prosjektrapport")
    const blob = await res.blob()
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `prosjektrapport.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
  }

  const genererTimeRapport = async () => {
    // Logikk for å generere timerapport
    const res = await fetch("/api/generer-timerapport")
    const blob = await res.blob()
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `timerapport.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totalt antall prosjekter
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{antallProsjekter}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totalt antall timer
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totaleTimer} timer</div>
          </CardContent>
        </Card>
      </div>

      {/* Knapper for å generere rapporter */}
      <div className="flex gap-4 mt-4">
        <Button onClick={genererProsjektRapport}>
          Generer prosjektrapport
        </Button>
        <Button onClick={genererTimeRapport}>
          Generer timerapport
        </Button>
      </div>
    </main>
  )
}