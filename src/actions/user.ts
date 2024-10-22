"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"


export async function updateUser(formData: FormData) {
  const userId = formData.get("userId") as string
  const navn = formData.get("navn") as string
  const etternavn = formData.get("etternavn") as string
  const email = formData.get("email") as string
  const position = formData.get("position") as string
  const role = formData.get("role") as string

  if (!userId || !navn || !etternavn || !email || !position || !role) {
    throw new Error("Manglende påkrevde felt")
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        navn,
        etternavn,
        email,
        position,
        role,
      },
    })

    revalidatePath("/admin")
    return { success: true, message: "Bruker oppdatert" }
  } catch (error) {
    console.error("Feil ved oppdatering av bruker:", error)
    return { success: false, message: "Kunne ikke oppdatere bruker" }
  }
}