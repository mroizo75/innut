import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  }

  const { navn, beskrivelse, startDato, sluttDato, status, bedriftId } = await request.json();

  try {
    const nyttProsjekt = await db.prosjekt.create({
      data: {
        navn,
        beskrivelse,
        startDato: new Date(startDato),
        sluttDato: new Date(sluttDato),
        status,
        bedrift: {
          connect: { id: bedriftId },
        },
      },
    });
    return NextResponse.json(nyttProsjekt);
  } catch (error) {
    console.error("Feil ved opprettelse av prosjekt:", error);
    return NextResponse.json({ error: "Feil ved opprettelse av prosjekt" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
  }

  try {
    const prosjekter = await db.prosjekt.findMany({
      where: {
        bedriftId: session.user.bedriftId,
      },
      select: {
        id: true,
        navn: true,
      },
    });
    return NextResponse.json(prosjekter);
  } catch (error) {
    console.error('Feil ved henting av prosjekter:', error);
    return NextResponse.json({ error: 'Kunne ikke hente prosjekter' }, { status: 500 });
  }
}

// Eksempel på API-ruten /api/prosjekter
export default async function handler(req: Request, res: Response) {
  try {
    const prosjekter = await db.prosjekt.findMany({
      include: {
        oppgaver: true, // Sørg for at oppgaver inkluderes
      },
    });
    res.status(200).json(prosjekter);
  } catch (error) {
    console.error('Feil ved henting av prosjekter:', error);
    res.status(500).json({ error: 'Feil ved henting av prosjekter' });
  }
}
