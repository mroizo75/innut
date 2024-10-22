import { NextResponse } from 'next/server'
import { db } from "@/lib/db"
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const skjema = await db.endringsSkjema.findUnique({
      where: { id: params.id },
    })

    if (!skjema) {
      return NextResponse.json({ error: 'Skjema ikke funnet' }, { status: 404 })
    }

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Her legger du til all informasjon fra skjemaet, inkludert signaturen
    // Du kan bruke samme logikk som i den opprinnelige generatePDF-funksjonen

    const pdfBytes = await pdfDoc.save()

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=endringsskjema_${skjema.changeNumber}.pdf`,
      },
    })
  } catch (error) {
    console.error("Feil ved generering av PDF:", error)
    return NextResponse.json({ error: "Kunne ikke generere PDF" }, { status: 500 })
  }
}