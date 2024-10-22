"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { uploadFile, deleteFile } from "@/lib/googleCloudStorage"

export async function uploadHMSHandbok(formData: FormData) {
  const session = await auth()
  const currentUser = await db.user.findUnique({
    where: { id: session?.user?.id },
    include: { bedrift: true },
  })

  if (!currentUser || !currentUser.bedrift) {
    throw new Error("Bruker eller bedrift ikke funnet")
  }

  const file = formData.get("file") as File
  if (!file) {
    throw new Error("Ingen fil lastet opp")
  }

  console.log("Starter opplasting av fil")
  const { url } = await uploadFile(file)
  console.log("Fil lastet opp, URL:", url)

  await db.bedrift.update({
    where: { id: currentUser.bedrift.id },
    data: { hmsHandbokUrl: url },
  })

  revalidatePath("/hms")

  return { url }
}

export async function uploadDocument(formData: FormData) {
  const session = await auth()
  const currentUser = await db.user.findUnique({
    where: { id: session?.user?.id },
    include: { bedrift: true },
  })

  if (!currentUser || !currentUser.bedrift) {
    throw new Error("Bruker eller bedrift ikke funnet")
  }

  const file = formData.get("file") as File
  const name = formData.get("name") as string

  if (!file || !name) {
    throw new Error("Manglende fil eller navn")
  }

  const { url } = await uploadFile(file)

  const document = await db.hMSDokument.create({
    data: {
      name,
      url,
      bedriftId: currentUser.bedrift.id,
    },
  })

  revalidatePath("/hms")

  return { id: document.id, url: document.url }
}

export async function deleteDocument(documentId: string) {
  const session = await auth()
  const currentUser = await db.user.findUnique({
    where: { id: session?.user?.id },
    include: { bedrift: true },
  })

  if (!currentUser || !currentUser.bedrift) {
    throw new Error("Bruker eller bedrift ikke funnet")
  }

  let document;
  if (documentId === 'hmsHandbok') {
    document = { url: currentUser.bedrift.hmsHandbokUrl, name: "HMS Håndbok" };
  } else {
    document = await db.hMSDokument.findUnique({
      where: { id: documentId },
    })
  }

  if (!document) {
    throw new Error("Dokument ikke funnet")
  }

  // Extract the filename from the URL
  const fileName = document.url.split('/').pop()

  if (!fileName) {
    throw new Error("Kunne ikke finne filnavnet")
  }

  try {
    // Delete the file from Google Cloud Storage
    await deleteFile(fileName)
  } catch (error) {
    console.error('Feil ved sletting av fil fra Cloud Storage:', error)
    // Fortsett med å slette dokumentet fra databasen selv om filen ikke kunne slettes
  }

  if (documentId === 'hmsHandbok') {
    // Update bedrift to remove HMS Håndbok URL
    await db.bedrift.update({
      where: { id: currentUser.bedrift.id },
      data: { hmsHandbokUrl: null },
    })
  } else {
    // Delete the document from the database
    await db.hMSDokument.delete({
      where: { id: documentId },
    })
  }

  revalidatePath("/hms")

  return { success: true }
}

export async function deleteHMSHandbok() {
  const session = await auth()
  const currentUser = await db.user.findUnique({
    where: { id: session?.user?.id },
    include: { bedrift: true },
  })

  if (!currentUser || !currentUser.bedrift) {
    throw new Error("Bruker eller bedrift ikke funnet")
  }

  if (!currentUser.bedrift.hmsHandbokUrl) {
    throw new Error("HMS Håndbok ikke funnet")
  }

  // Extract the filename from the URL
  const fileName = currentUser.bedrift.hmsHandbokUrl.split('/').pop()

  if (!fileName) {
    throw new Error("Kunne ikke finne filnavnet")
  }

  // Delete the file from Google Cloud Storage
  await deleteFile(fileName)

  // Update bedrift to remove HMS Håndbok URL
  await db.bedrift.update({
    where: { id: currentUser.bedrift.id },
    data: { hmsHandbokUrl: null },
  })

  revalidatePath("/hms")

  return { success: true }
}

export async function getHMSDocuments() {
    const session = await auth()
    const currentUser = await db.user.findUnique({
        where: { id: session?.user?.id },
        include: { bedrift: true },
    })

    if (!currentUser || !currentUser.bedrift) {
        throw new Error("Bruker eller bedrift ikke funnet")
    }

    const documents = await db.hMSDokument.findMany({
        where: { bedriftId: currentUser.bedrift.id },
    })

    return documents
}