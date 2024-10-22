import { NextResponse } from 'next/server'
import formidable from 'formidable-serverless'
import { auth } from "@/auth"
import { db } from '@/lib/db'
import { uploadFile } from '@/lib/googleCloudStorage'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request, { params }) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ message: 'Ikke autentisert' }, { status: 401 })
  }

  const oppgaveId = params.oppgaveId

  const oppgave = await db.oppgave.findUnique({
    where: { id: oppgaveId },
  })

  if (oppgave?.brukerId !== session.user.id) {
    return NextResponse.json({ message: 'Ingen tilgang' }, { status: 403 })
  }

  const form = new formidable.IncomingForm()
  const [fields, files] = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve([fields, files])
    })
  })

  const fileArray = Array.isArray(files.files) ? files.files : [files.files]

  const nyeFiler = await Promise.all(
    fileArray.map(async (file) => {
      const result = await uploadFile(file)
      const fil = await db.fil.create({
        data: {
          url: result.url,
          navn: result.navn,
          oppgaveId,
          type: 'fil',
        },
      })
      return fil
    })
  )

  return NextResponse.json(nyeFiler)
}