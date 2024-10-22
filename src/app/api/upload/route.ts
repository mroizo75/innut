import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { uploadFile } from "@/lib/googleCloudStorage"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Uautorisert", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new NextResponse("Ingen fil lastet opp", { status: 400 })
    }

    const result = await uploadFile(file)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[FILE_UPLOAD]", error)
    return new NextResponse("Intern Feil", { status: 500 })
  }
}