import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const latestChange = await db.endringsSkjema.findFirst({
      where: { bedriftId: session.user.bedriftId },
      orderBy: {
        changeNumber: 'desc',
      },
      select: {
        changeNumber: true,
      },
    });

    return NextResponse.json({ changeNumber: latestChange?.changeNumber || null });
  } catch (error) {
    console.error("Feil ved henting av siste endringsnummer:", error);
    return NextResponse.json({ error: "Kunne ikke hente siste endringsnummer" }, { status: 500 });
  }
}