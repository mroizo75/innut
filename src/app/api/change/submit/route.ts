import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from "@/auth"


export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const data = await req.json()
    const { changeNumber, projectId, projectName, description, submittedBy, implementationDate, followUpPerson, comments } = data
    
    if (!changeNumber || !projectName || !description || !implementationDate) {
      return NextResponse.json({ error: "Manglende påkrevde felt" }, { status: 400 })
    }
    
    const newChange = await db.endringsSkjema.create({
      data: {
        changeNumber,
        projectId,
        projectName,
        description,
        submittedBy,
        implementationDate: new Date(implementationDate),
        followUpPerson,
        comments,
        status: 'Åpen',
        bedriftId: session.user.bedriftId,
        opprettetAvId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Endringsskjema opprettet", change: newChange })
  } catch (error) {
    console.error("Feil ved opprettelse av endringsskjema:", error)
    return NextResponse.json({ error: "Kunne ikke opprette endringsskjema" }, { status: 500 })
  }
}

function getServerSession(authOptions: any) {
  throw new Error('Function not implemented.');
}
