import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    const timeEntries = await db.timeEntry.findMany({
      where: { brukerId: userId },
      include: { prosjekt: true, oppgave: true },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(timeEntries, { status: 200 })
  } catch (error) {
    console.error("Feil ved henting av timeregistreringer:", error)
    return NextResponse.json({ 
      error: "Kunne ikke hente timeregistreringer", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}