import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  const { token, password } = await request.json()

  if (!token || !password) {
    return NextResponse.json({ error: "Token og passord er påkrevd" }, { status: 400 })
  }

  try {
    const user = await db.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Token er ugyldig eller utløpt" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    })

    return NextResponse.json({ message: "Passordet er satt opp" })
  } catch (error) {
    console.error("Feil ved oppdatering av passord:", error)
    return NextResponse.json({ error: "Kunne ikke sette opp passord" }, { status: 500 })
  }
}