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
    const oppdatertProsjekt = await db.prosjekt.update({
      where: { id: prosjektId },
      data: { status: "AVSLUTTET" },
    })

    // Finn alle brukere knyttet til prosjektet
    const brukere = await db.user.findMany({
      where: {
        prosjekter: {
          some: {
            id: prosjektId,
          },
        },
      },
    })

    // Opprett varsler og send Socket.IO-hendelser
    for (const bruker of brukere) {
      await db.notification.create({
        data: {
          message: `Prosjektet "${oppdatertProsjekt.navn}" er fullført.`,
          userId: bruker.id,
          url: `/prosjekt/${prosjektId}`,
        },
      })

      if (global.io) {
        global.io.to(bruker.id).emit('nyNotifikasjon', {
          message: `Prosjektet "${oppdatertProsjekt.navn}" er fullført.`,
          url: `/prosjekt/${prosjektId}`,
        })
      }
    }

    return NextResponse.json({ message: "Prosjekt fullført" })
  } catch (error) {
    console.error("Feil ved fullføring av prosjekt:", error)
    return NextResponse.json({ error: "Feil ved fullføring av prosjekt" }, { status: 500 })
  }
}
