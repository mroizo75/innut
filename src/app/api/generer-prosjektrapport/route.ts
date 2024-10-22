import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import ExcelJS from "exceljs"

export async function GET(request: Request) {
  const session = await auth()
  const currentUser = await db.user.findUnique({
    where: { id: session?.user?.id },
  })

  if (!currentUser) {
    return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
  }

  if (currentUser.role !== "ADMIN" && currentUser.role !== "LEDER") {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 })
  }

  try {
    // Hent prosjekter og summer timer per prosjekt
    const prosjektData = await db.prosjekt.findMany({
      where: { bedriftId: currentUser.bedriftId },
      include: {
        timeEntries: true, // Inkluder timeEntries for hvert prosjekt
      },
    })

    // Opprett Excel-arbeidsbok
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Prosjektrapport")

    // Legg til kolonneoverskrifter
    worksheet.columns = [
      { header: "Prosjekt ID", key: "id", width: 15 },
      { header: "Navn", key: "navn", width: 25 },
      { header: "Beskrivelse", key: "beskrivelse", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Startdato", key: "startDato", width: 15 },
      { header: "Sluttdato", key: "sluttDato", width: 15 },
      { header: "Totale timer", key: "totaleTimer", width: 15 },
    ]

    // Legg til data
    for (const prosjekt of prosjektData) {
      // Summer timer for hvert prosjekt
      const totaleTimer = prosjekt.timeEntries.reduce(
        (sum, entry) => sum + entry.hours,
        0
      )

      worksheet.addRow({
        id: prosjekt.id,
        navn: prosjekt.navn,
        beskrivelse: prosjekt.beskrivelse || "",
        status: prosjekt.status,
        startDato: prosjekt.startDato.toISOString().split('T')[0],
        sluttDato: prosjekt.sluttDato.toISOString().split('T')[0],
        totaleTimer: totaleTimer,
      })
    }

    // Generer buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=prosjektrapport.xlsx`,
      },
    })
  } catch (error) {
    console.error("Feil ved generering av prosjektrapport:", error)
    return NextResponse.json(
      { error: "Kunne ikke generere prosjektrapport" },
      { status: 500 }
    )
  }
}