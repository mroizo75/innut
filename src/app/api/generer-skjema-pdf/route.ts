import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skjemaId = searchParams.get('id');

  if (!skjemaId) {
    return NextResponse.json(
      { error: 'Skjema ID er påkrevd' },
      { status: 400 }
    );
  }

  try {
    const skjema = await db.skjema.findUnique({
      where: { id: skjemaId },
      include: {
        opprettetAv: true,
        behandler: true,
      },
    });

    if (!skjema) {
      return NextResponse.json(
        { error: 'Skjema ikke funnet' },
        { status: 404 }
      );
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width, height } = page.getSize();
    const fontSize = 12;
    let yOffset = height - 50;

    const addText = (text: string) => {
      page.drawText(text, {
        x: 50,
        y: yOffset,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      yOffset -= 20;
    };

    addText(`ID: ${skjema.id}`);
    addText(`Endringsnummer: ${skjema.changeNumber || 'Ikke angitt'}`);
    addText(`Prosjektnavn: ${skjema.projectName || 'Ikke angitt'}`);
    addText(`Beskrivelse: ${skjema.description || 'Ikke angitt'}`);
    addText(`Innsendt av: ${skjema.submittedBy || 'Ikke angitt'}`);
    addText(`Implementeringsdato: ${skjema.implementationDate ? skjema.implementationDate.toISOString().split('T')[0] : 'Ikke angitt'}`);
    addText(`Oppfølgingsperson: ${skjema.followUpPerson || 'Ikke angitt'}`);
    addText(`Kommentarer: ${skjema.comments || 'Ikke angitt'}`);
    addText(`Status: ${skjema.status || 'Ikke angitt'}`);
    addText(`Løsning: ${skjema.solution || 'Ikke angitt'}`);
    addText(`Behandler: ${skjema.behandler ? `${skjema.behandler.navn} ${skjema.behandler.etternavn}` : 'Ikke tildelt'}`);

    if (skjema.signature) {
      try {
        const signatureParts = skjema.signature.split(',');
        if (signatureParts.length === 2) {
          const base64Data = signatureParts[1];
          const signatureImage = await pdfDoc.embedPng(base64Data);
          const signatureDims = signatureImage.scale(0.5);
          
          page.drawImage(signatureImage, {
            x: 50,
            y: yOffset - signatureDims.height,
            width: signatureDims.width,
            height: signatureDims.height,
          });
        }
      } catch (err) {
        console.error('Feil ved behandling av signaturbildet:', err);
        addText('Signatur: Kunne ikke legge til signaturbildet');
      }
    } else {
      addText('Signatur: Ingen signatur');
    }

    const pdfBytes = await pdfDoc.save();

    // Returner PDF-en som respons
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=endringsskjema_${
          skjema.changeNumber || skjema.id
        }.pdf`,
      },
    });
  } catch (error) {
    console.error('Feil ved generering av PDF:', error);
    return NextResponse.json(
      { error: 'Kunne ikke generere PDF' },
      { status: 500 }
    );
  }
}