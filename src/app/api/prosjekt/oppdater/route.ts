import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
  }

  const { prosjektId, navn, beskrivelse, startDato, sluttDato } = await request.json()

  try {
    await db.prosjekt.update({
      where: { id: prosjektId },
      data: {
        navn,
        beskrivelse,
        startDato: new Date(startDato),
        sluttDato: new Date(sluttDato),
      },
    })
    return NextResponse.json({ message: "Prosjekt oppdatert" })
  } catch (error) {
    console.error("Feil ved oppdatering av prosjekt:", error)
    return NextResponse.json({ error: "Feil ved oppdatering av prosjekt" }, { status: 500 })
  }
}