import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { downloadFile } from '@/lib/googleCloudStorage';

export async function GET(
  request: Request,
  { params }: { params: { prosjektId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.redirect('/auth/login');
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.redirect('/auth/login');
    }

    if (
      currentUser.role !== 'ADMIN' &&
      currentUser.role !== 'LEDER' &&
      currentUser.role !== 'PROSJEKTLEDER'
    ) {
      return NextResponse.json({ error: 'Ingen tilgang' }, { status: 403 });
    }

    const prosjektId = params.prosjektId;

    // Hent prosjektet med all nødvendig informasjon
    const prosjekt = await db.prosjekt.findUnique({
      where: { id: prosjektId },
      include: {
        users: true,
        oppgaver: {
          include: {
            bilder: true,
          },
        },
        skjemaer: true,
        endringsSkjemaer: true,
        sjaSkjemaer: true,
        bilder: true,
      },
    });

    if (!prosjekt) {
      return NextResponse.json({ error: 'Prosjekt ikke funnet' }, { status: 404 });
    }

    // Opprett en ny PDF med pdf-lib
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let yPosition = height - 50; // Startposisjon for tekst

    const splitTextIntoLines = (text: string, size: number, maxWidth: number) => {
      const words = text.split(' ');
      let lines = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testLineWidth = font.widthOfTextAtSize(testLine, size);

        if (testLineWidth < maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      return lines;
    };

    const drawWrappedText = (text: string, size = 12, color = rgb(0, 0, 0)) => {
      const maxWidth = width - 100;
      const lines = splitTextIntoLines(text, size, maxWidth);

      for (const line of lines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size,
          font,
          color,
        });
        yPosition -= size + 5;
      }
    };

    const checkPageSpace = (requiredSpace: number) => {
      if (yPosition < requiredSpace) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }
    };

    // Start å skrive til PDF-en
    drawWrappedText(`Sluttrapport for ${prosjekt.navn}`, 20);
    yPosition -= 10;

    // Prosjektinformasjon
    drawWrappedText(`Beskrivelse: ${prosjekt.beskrivelse || 'Ingen beskrivelse'}`, 14);
    drawWrappedText(`Startdato: ${prosjekt.startDato.toLocaleDateString('nb-NO')}`);
    drawWrappedText(`Sluttdato: ${prosjekt.sluttDato.toLocaleDateString('nb-NO')}`);
    drawWrappedText(`Status: ${prosjekt.status}`);
    yPosition -= 10;

    // Prosjektdeltakere
    checkPageSpace(100);
    drawWrappedText('Prosjektdeltakere:', 16);
    prosjekt.users.forEach((user) => {
      drawWrappedText(`- ${user.navn} ${user.etternavn} (${user.role})`);
    });
    yPosition -= 10;

    // Oppgaveoversikt
    checkPageSpace(150);
    drawWrappedText('Oppgaver:', 16);
    for (const oppgave of prosjekt.oppgaver) {
      drawWrappedText(`- ${oppgave.tittel} (${oppgave.status})`);
      // Håndter bilder knyttet til oppgaven
      for (const bilde of oppgave.bilder) {
        if (yPosition < 150) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        try {
          const imageBuffer = await downloadFile(bilde.url);
          const image = await pdfDoc.embedJpg(imageBuffer); // Bruk embedPng hvis bildet er PNG
          const imgDims = image.scale(0.5);
          yPosition -= imgDims.height + 10;
          page.drawImage(image, {
            x: 50,
            y: yPosition,
            width: imgDims.width,
            height: imgDims.height,
          });
        } catch (error) {
          console.error('Feil ved innlasting av bilde:', error);
        }
      }
    }
    yPosition -= 10;

    // Skjemaoversikt (Avvik)
    checkPageSpace(150);
    drawWrappedText('Avviksskjemaer:', 16);
    for (const skjema of prosjekt.skjemaer) {
      drawWrappedText(`- Avviksnummer: ${skjema.avviksnummer}`);
      drawWrappedText(`  Opprettet dato: ${new Date(skjema.opprettetDato).toLocaleDateString('nb-NO')}`);
      drawWrappedText(`  Beskrivelse: ${skjema.innhold?.description || 'Ingen beskrivelse'}`);
      drawWrappedText(`  Kortsiktig løsning: ${skjema.solution || 'Ingen'}`);
      drawWrappedText(`  Langsiktig løsning: ${skjema.notes || 'Ingen'}`);
      yPosition -= 10;
    }
    yPosition -= 10;

    // Endringsskjemaer
    checkPageSpace(100);
    drawWrappedText('Endringsskjemaer:', 16);
    for (const skjema of prosjekt.endringsSkjemaer) {
      drawWrappedText(`- ${skjema.changeNumber}: ${skjema.projectName} 
        (${skjema.status}) ${skjema.description} ${skjema.comments} ${skjema.submittedBy} `);
    }
    yPosition -= 10;

    // SJA-skjemaer
    checkPageSpace(100);
    drawWrappedText('SJA-skjemaer:', 16);
    for (const skjema of prosjekt.sjaSkjemaer) {
      drawWrappedText(`- ${skjema.jobTitle} (${skjema.status})`);
    }
    yPosition -= 10;

    // Bilder knyttet til prosjektet
    checkPageSpace(150);
    drawWrappedText('Bilder:', 16);
    for (const bilde of prosjekt.bilder) {
      if (yPosition < 150) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }
      try {
        const imageBuffer = await downloadFile(bilde.url);
        const image = await pdfDoc.embedJpg(imageBuffer); // Bruk embedPng hvis bildet er PNG
        const imgDims = image.scale(0.5);
        yPosition -= imgDims.height + 10;
        page.drawImage(image, {
          x: 50,
          y: yPosition,
          width: imgDims.width,
          height: imgDims.height,
        });
        drawWrappedText(bilde.beskrivelse || 'Ingen beskrivelse');
      } catch (error) {
        console.error('Feil ved innlasting av bilde:', error);
      }
    }

    // Generer PDF-en
    const pdfBytes = await pdfDoc.save();

    // Returner PDF-filen som respons
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sluttrapport_${prosjekt.navn}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Feil ved generering av sluttrapport:', error);
    return NextResponse.json({ error: 'Kunne ikke generere sluttrapport' }, { status: 500 });
  }
}
