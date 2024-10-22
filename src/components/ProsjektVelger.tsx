"use client"
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"

interface Prosjekt {
  id: string
  navn: string
}

interface ProsjektVelgerProps {
  currentUser: any
}

export function ProsjektVelger({ currentUser }: ProsjektVelgerProps) {
  const [prosjekter, setProsjekter] = useState([])

  useEffect(() => {
    const unikeProsjekterMap = new Map()

    currentUser.oppgaver.forEach((oppgave) => {
      const prosjekt = oppgave.prosjekt
      if (!unikeProsjekterMap.has(prosjekt.id)) {
        unikeProsjekterMap.set(prosjekt.id, prosjekt)
      }
    })

    setProsjekter(Array.from(unikeProsjekterMap.values()))
  }, [currentUser])

  const router = useRouter()

  return (
    <Select onValueChange={(value) => router.push(`/kanban/${value}`)}>
      <SelectTrigger className="w-full mt-4">
        <SelectValue placeholder="Velg prosjekt" />
      </SelectTrigger>
      <SelectContent>
        {prosjekter.map((prosjekt) => (
          <SelectItem key={prosjekt.id} value={prosjekt.id}>
            {prosjekt.navn}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}