import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { oppgaveId, brukerId, innhold } = await request.json();

  try {
    const nyKommentar = await db.kommentar.create({
      data: {
        innhold,
        oppgaveId,
        brukerId,
      },
      include: {
        bruker: {
          select: {
            navn: true,
            bildeUrl: true, // Legg til dette
          },
        },
      },
    });
    return NextResponse.json(nyKommentar);
  } catch (error) {
    console.error("Feil ved oppretting av kommentar:", error);
    return NextResponse.error();
  }
}