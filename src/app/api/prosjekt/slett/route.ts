import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
  }

  const { prosjektId } = await request.json()

  try {
    await db.prosjekt.delete({
      where: { id: prosjektId },
    })
    return NextResponse.json({ message: "Prosjekt slettet" })
  } catch (error) {
    console.error("Feil ved sletting av prosjekt:", error)
    return NextResponse.json({ error: "Feil ved sletting av prosjekt" }, { status: 500 })
  }
}