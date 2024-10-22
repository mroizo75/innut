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
    // Gruppér timeføringer per bruker og summer timer
    const timeData = await db.timeEntry.groupBy({
      by: ['userId'],
      where: { prosjekt: { bedriftId: currentUser.bedriftId } },
      _sum: { hours: true },
    })

    // Hent brukerinformasjon
    const userIds = timeData.map(data => data.userId)
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, navn: true, etternavn: true },
    })

    // Lag en mapping fra userId til brukernavn
    const userMap = new Map()
    users.forEach(user => {
      userMap.set(user.id, `${user.navn} ${user.etternavn}`)
    })

    // Opprett Excel-arbeidsbok
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Timerapport")

    // Legg til kolonneoverskrifter
    worksheet.columns = [
      { header: "Bruker", key: "bruker", width: 30 },
      { header: "Totale timer", key: "totaleTimer", width: 15 },
    ]

    // Legg til data
    timeData.forEach(data => {
      worksheet.addRow({
        bruker: userMap.get(data.userId) || "Ukjent bruker",
        totaleTimer: data._sum.hours || 0,
      })
    })

    // Generer buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=timerapport.xlsx`,
      },
    })
  } catch (error) {
    console.error("Feil ved generering av timerapport:", error)
    return NextResponse.json(
      { error: "Kunne ikke generere timerapport" },
      { status: 500 }
    )
  }
}