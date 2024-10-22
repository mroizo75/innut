import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatePDF } from '@/lib/pdfUtils';

export async function GET(
  request: Request,
  { params }: { params: { skjemaType: string; id: string } }
) {
  let { skjemaType, id } = params;

  try {
    let skjema;

    switch (skjemaType.toLowerCase()) {
      case 'avvik':
        skjema = await db.skjema.findUnique({
          where: { id },
          select: {
            id: true,
            type: true,
            tittel: true,
            innhold: true,
            solution: true,
            notes: true,
            status: true,
            opprettetDato: true,
            bedrift: true, // Legg til dette
            opprettetAv: {
              select: {
                navn: true,
                etternavn: true,
              },
            },
            behandler: {
              select: {
                navn: true,
                etternavn: true,
              },
            },
          },
        });
        skjemaType = 'Avvik'; // Standardiserer skjematype
        break;

      case 'endring':
        skjema = await db.endringsSkjema.findUnique({
          where: { id },
          select: {
            id: true,
            changeNumber: true,
            projectId: true,
            projectName: true,
            description: true,
            submittedBy: true,
            implementationDate: true,
            followUpPerson: true,
            comments: true,
            solution: true,
            status: true,
            opprettetDato: true,
            bedrift: true,
            opprettetAv: {
              select: {
                navn: true,
                etternavn: true,
              },
            },
            behandler: {
              select: {
                navn: true,
                etternavn: true,
              },
            },
          },
        });
        skjemaType = 'Endring'; // Standardiserer skjematype
        break;

      case 'sja':
        skjema = await db.sJASkjema.findUnique({
          where: { id },
          select: {
            id: true,
            jobTitle: true,
            jobLocation: true,
            jobDate: true,
            participants: true,
            jobDescription: true,
            identifiedRisks: true,
            riskMitigation: true,
            responsiblePerson: true,
            approvalDate: true,
            comments: true,
            status: true,
            opprettetDato: true,
            bedrift: true,
            opprettetAv: {
              select: {
                navn: true,
                etternavn: true,
              },
            },
            behandler: {
              select: {
                navn: true,
                etternavn: true,
              },
            },
          },
        });
        skjemaType = 'SJA'; // Standardiserer skjematype
        break;

      default:
        return NextResponse.json({ error: 'Ugyldig skjematype' }, { status: 400 });
    }

    if (!skjema) {
      return NextResponse.json({ error: 'Skjema ikke funnet' }, { status: 404 });
    }

    // Generer PDF-en basert på skjemaets data
    const pdfBytes = await generatePDF(skjema, skjemaType);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${skjemaType}_${id}.pdf`,
      },
    });
  } catch (error) {
    console.error('Feil ved generering av PDF:', error);
    return NextResponse.json({ error: 'Kunne ikke generere PDF' }, { status: 500 });
  }
}