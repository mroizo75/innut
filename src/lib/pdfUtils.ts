import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';

export async function generatePDF(skjema: any, skjemaType: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4-størrelse i punkter
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Definer fontstørrelser
  const headerFontSize = 12;
  const titleFontSize = 18; // Større font for tittelen
  const contentFontSize = 12;
  const footerFontSize = 10;

  // Hent sidestørrelse
  const { width, height } = page.getSize();

  // Definer marginer
  const marginLeft = 50;
  const marginRight = 50;

  // **Legg til bedriftsnavn øverst, sentrert**
  const companyName: string = skjema.bedrift?.navn || 'Bedriftsnavn';
  const companyNameWidth = font.widthOfTextAtSize(companyName, headerFontSize);
  const companyY = height - 50;
  page.drawText(companyName, {
    x: (width - companyNameWidth) / 2,
    y: companyY,
    size: headerFontSize,
    font: font,
    color: rgb(0, 0, 0),
  });

  // **Plasser ID-feltet**
  const idY = companyY - headerFontSize - 20; // Bruker fontstørrelsen for nøyaktig mellomrom
  page.drawText(`ID: ${skjema.id}`, {
    x: marginLeft,
    y: idY,
    size: headerFontSize,
    font: font,
    color: rgb(0, 0, 0),
  });

  // Oppdater Y-posisjonen for videre innhold
  let currentY = idY - 20;

  // **Header-tabell**
  const headerHeight = 60;
  const headerY = currentY - 10; // Startposisjon for header (under ID-feltet)

  // Tegn rektangel rundt header
  page.drawRectangle({
    x: marginLeft,
    y: headerY - headerHeight,
    width: width - marginLeft - marginRight,
    height: headerHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Del headeren i kolonner
  const numColumns = 3;
  const columnWidth = (width - marginLeft - marginRight) / numColumns;

  // Header-felt og verdier
  const headerFields = [
    { label: 'Skjematype', value: skjemaType },
    { label: 'Dato', value: formatDate(skjema.opprettetDato) },
    {
      label: 'Ansvarlig',
      value: `${skjema.opprettetAv?.navn || ''} ${skjema.opprettetAv?.etternavn || ''}`,
    },
  ];

  // Tegn vertikale linjer og legg til tekst i hver celle
  for (let i = 0; i <= numColumns; i++) {
    const x = marginLeft + i * columnWidth;
    // Vertikal linje
    page.drawLine({
      start: { x: x, y: headerY },
      end: { x: x, y: headerY - headerHeight },
      color: rgb(0, 0, 0),
      thickness: 1,
    });

    if (i < numColumns) {
      const field = headerFields[i];
      const cellX = marginLeft + i * columnWidth + 5;
      const cellY = headerY - 15;
      const cellWidth = columnWidth - 10;

      drawWrappedText(
        page,
        `${field.label}: ${field.value}`,
        cellX,
        cellY,
        cellWidth,
        headerFontSize,
        font
      );
    }
  }

  // Horisontal linje nederst i headeren
  page.drawLine({
    start: { x: marginLeft, y: headerY - headerHeight },
    end: { x: width - marginRight, y: headerY - headerHeight },
    color: rgb(0, 0, 0),
    thickness: 1,
  });

  // **Tittel uten etikett**
  let contentY = headerY - headerHeight - 30;
  if (skjema.tittel || skjema.jobTitle || skjema.description) {
    const title: string = skjema.tittel || skjema.jobTitle || skjema.description;
    page.drawText(title, {
      x: marginLeft,
      y: contentY,
      size: titleFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    contentY -= titleFontSize + 20; // Legg til mellomrom etter tittelen
  }

  // **Hovedinnhold basert på skjematype**
  if (skjemaType === 'Avvik') {
    // Legg til felter for Avvik
    const contentFields = [
      {
        label: 'Opprettet av',
        value: `${skjema.opprettetAv?.navn || ''} ${skjema.opprettetAv?.etternavn || ''}`,
      },
      {
        label: 'Behandlet av',
        value: `${skjema.behandler?.navn || ''} ${skjema.behandler?.etternavn || ''}`,
      },
      { label: 'Status', value: skjema.status },
      { label: 'Kortsiktig utbedring', value: skjema.solution },
      { label: 'Langsiktig utbedring', value: skjema.notes },
    ];

    contentY = addContentFields(
      page,
      contentFields,
      contentY,
      font,
      contentFontSize,
      width,
      marginLeft,
      marginRight
    );

  } else if (skjemaType === 'Endring') {
    // Legg til felter for EndringsSkjema
    const contentFields = [
      { label: 'Endringsnummer', value: skjema.changeNumber },
      { label: 'Prosjekt ID', value: skjema.projectId },
      { label: 'Prosjektnavn', value: skjema.projectName },
      // Beskrivelse vises som tittel allerede
      { label: 'Innsendt av', value: skjema.submittedBy },
      { label: 'Implementeringsdato', value: formatDate(skjema.implementationDate) },
      { label: 'Oppfølgingsperson', value: skjema.followUpPerson },
      { label: 'Kommentarer', value: skjema.comments },
      { label: 'Løsning', value: skjema.solution },
      { label: 'Notater', value: skjema.notes },
    ];

    contentY = addContentFields(
      page,
      contentFields,
      contentY,
      font,
      contentFontSize,
      width,
      marginLeft,
      marginRight
    );

  } else if (skjemaType === 'SJA') {
    // Legg til felter for SJASkjema
    const contentFields = [
      // JobTitle vises som tittel allerede
      { label: 'Sted', value: skjema.jobLocation },
      { label: 'Dato for jobb', value: skjema.jobDate },
      { label: 'Deltakere', value: skjema.participants },
      { label: 'Jobbbeskrivelse', value: skjema.jobDescription },
      { label: 'Identifiserte risikoer', value: skjema.identifiedRisks },
      { label: 'Tiltak for å redusere risiko', value: skjema.riskMitigation },
      { label: 'Ansvarlig person', value: skjema.responsiblePerson },
      { label: 'Kommentarer', value: skjema.comments },
      { label: 'Notater', value: skjema.notes },
    ];

    contentY = addContentFields(
      page,
      contentFields,
      contentY,
      font,
      contentFontSize,
      width,
      marginLeft,
      marginRight
    );
  }

  // **Footer med signatur og dato**
  const footerY = 50;
  const footerHeight = 60;
  const footerColumnWidth = (width - marginLeft - marginRight) / 2;

  // Tegn rektangel rundt footeren
  page.drawRectangle({
    x: marginLeft,
    y: footerY,
    width: width - marginLeft - marginRight,
    height: footerHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Vertikal linje mellom kolonnene
  page.drawLine({
    start: { x: marginLeft + footerColumnWidth, y: footerY },
    end: { x: marginLeft + footerColumnWidth, y: footerY + footerHeight },
    color: rgb(0, 0, 0),
    thickness: 1,
  });

  // Dato-feltet
  const dateX = marginLeft + 5;
  const dateY = footerY + footerHeight - 20;
  page.drawText('Dato:', {
    x: dateX,
    y: dateY,
    size: footerFontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  page.drawText(formatDate(skjema.approvalDate || skjema.opprettetDato), {
    x: dateX,
    y: dateY - footerFontSize - 5,
    size: footerFontSize,
    font: font,
    color: rgb(0, 0, 0),
  });

  // Signatur-feltet
  const signatureX = marginLeft + footerColumnWidth + 5;
  const signatureY = footerY + footerHeight - 20;
  page.drawText('Signatur:', {
    x: signatureX,
    y: signatureY,
    size: footerFontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  // Tegn en linje for signaturen
  page.drawLine({
    start: { x: signatureX, y: signatureY - 15 },
    end: { x: signatureX + footerColumnWidth - 10, y: signatureY - 15 },
    color: rgb(0, 0, 0),
    thickness: 1,
  });

  // Legg til signaturbilde hvis tilgjengelig
  if (skjema.signature) {
    try {
      const signatureImage = await pdfDoc.embedPng(skjema.signature);
      const signatureDims = signatureImage.scale(0.5);
      page.drawImage(signatureImage, {
        x: signatureX,
        y: signatureY - 50,
        width: signatureDims.width,
        height: signatureDims.height,
      });
    } catch (err) {
      console.error('Feil ved innlasting av signatur:', err);
    }
  }

  // Generer og returner PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// Hjelpefunksjon for å legge til innholds-felter
function addContentFields(
  page: PDFPage,
  fields: { label: string; value: string | number | undefined }[],
  startY: number,
  font: PDFFont,
  fontSize: number,
  pageWidth: number,
  marginLeft: number,
  marginRight: number
): number {
  let y = startY;
  const maxWidth = pageWidth - marginLeft - marginRight;

  fields.forEach(field => {
    if (field.value !== undefined && field.value !== null) {
      y -= drawWrappedText(
        page,
        `${field.label}:`,
        marginLeft,
        y,
        maxWidth,
        fontSize,
        font
      ) + 5;

      y -= drawWrappedText(
        page,
        `${field.value}`,
        marginLeft + 20, // Indenter verdien
        y,
        maxWidth - 20,
        fontSize,
        font
      ) + 15; // Legg til mellomrom mellom feltene
    }
  });

  return y;
}

// Hjelpefunksjon for å formatere datoer
function formatDate(dateInput: Date | string | undefined): string {
  if (!dateInput) return 'Ikke angitt';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Ugyldig dato';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Hjelpefunksjon for tekstbryting
function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  font: PDFFont
): number {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  for (const line of lines) {
    page.drawText(line, {
      x: x,
      y: y,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    y -= fontSize + 2;
  }

  return lines.length * (fontSize + 2);
}