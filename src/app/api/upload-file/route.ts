import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/googleCloudStorage";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const formData = await request.formData();
  const oppgaveId = formData.get('oppgaveId') as string;
  const filer = formData.getAll('filer') as File[];

  if (!oppgaveId || filer.length === 0) {
    return NextResponse.json({ error: 'Ugyldig data' }, { status: 400 });
  }

  try {
    // Last opp filer og knytt dem til oppgaven
    const filOpprettelser = filer.map(async (fil) => {
      const { url, navn } = await uploadFile(fil);
      return db.fil.create({
        data: {
          url,
          navn,
          oppgaveId,
        },
      });
    });

    await Promise.all(filOpprettelser);

    // Hent den oppdaterte oppgaven med filer
    const oppdatertOppgave = await db.oppgave.findUnique({
      where: { id: oppgaveId },
      include: {
        filer: true,
        bruker: {
          select: {
            navn: true,
            etternavn: true,
          },
        },
        kommentarer: {
          include: {
            bruker: {
              select: {
                navn: true,
              },
            },
          },
        },
      },
    });

    // Revalidere siden
    revalidatePath(`/kanban/${oppdatertOppgave.prosjektId}`);

    return NextResponse.json(oppdatertOppgave);
  } catch (error) {
    console.error('Feil ved opplasting av filer:', error);
    return NextResponse.json({ error: 'Feil ved opplasting av filer' }, { status: 500 });
  }
}