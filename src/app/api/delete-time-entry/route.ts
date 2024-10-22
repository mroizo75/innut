import { NextApiRequest, NextApiResponse } from "next"
import { auth } from "@/auth"
import { deleteTimeEntry } from "@/data/timeEntry"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Metode ikke tillatt" })
  }

  const session = await auth(req, res)
  const userId = session?.user?.id

  if (!userId) {
    return res.status(401).json({ error: "Ikke autentisert" })
  }

  const { id } = req.query

  try {
    await deleteTimeEntry(id as string)
    res.status(200).json({ message: "Timeregistrering slettet" })
  } catch (error) {
    res.status(500).json({ error: "Kunne ikke slette timeregistrering" })
  }
}