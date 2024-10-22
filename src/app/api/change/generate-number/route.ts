import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    let newNumber = 1;
    let changeNumber;
    let existingChange;

    do {
      changeNumber = `EN${newNumber.toString().padStart(5, '0')}`;
      existingChange = await db.endringsSkjema.findFirst({
        where: { 
          bedriftId: session.user.bedriftId,
          changeNumber: changeNumber
        },
      });

      if (existingChange) {
        newNumber++;
      }
    } while (existingChange);

    return NextResponse.json({ changeNumber });
  } catch (error) {
    console.error("Feil ved generering av endringsnummer:", error);
    return NextResponse.json({ error: "Kunne ikke generere endringsnummer" }, { status: 500 });
  }
}