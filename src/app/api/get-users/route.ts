import { NextResponse } from 'next/server'
import { getUsers } from '@/data/user'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bedriftId = searchParams.get('bedriftId')

  if (!bedriftId) {
    return NextResponse.json({ error: 'bedriftId er påkrevd' }, { status: 400 })
  }

  try {
    const users = await getUsers(bedriftId)
    return NextResponse.json(users)
  } catch (error) {
    console.error('Feil ved henting av brukere:', error)
    return NextResponse.json({ error: 'Feil ved henting av brukere' }, { status: 500 })
  }
}