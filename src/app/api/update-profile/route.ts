import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Uautorisert", { status: 401 })
    }

    const body = await req.json()
    const { navn, etternavn, email, position, bildeUrl } = body

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        navn,
        etternavn,
        email,
        position,
        bildeUrl,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[USER_UPDATE]", error)
    return new NextResponse("Intern Feil", { status: 500 })
  }
}