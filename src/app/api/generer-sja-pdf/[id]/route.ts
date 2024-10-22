import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSJAPDF } from '@/lib/pdfGenerator'; // Du må implementere denne funksjonen

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const sjaSkjema = await db.sJASkjema.findUnique({
      where: { id },
      include: {
        behandler: true,
        opprettetAv: true,
      },
    });

    if (!sjaSkjema) {
      return new NextResponse('SJA-skjema ikke funnet', { status: 404 });
    }

    const pdfBuffer = await generateSJAPDF(sjaSkjema);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sja_skjema_${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Feil ved generering av SJA-PDF:', error);
    return new NextResponse('Intern serverfeil', { status: 500 });
  }
}