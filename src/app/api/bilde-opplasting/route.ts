import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(
  request: Request,
  { params }: { params: { prosjektId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
  }

  const prosjektId = params.prosjektId;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const beskrivelse = formData.get('beskrivelse') as string;

    if (!file) {
      return NextResponse.json({ error: 'Ingen fil lastet opp' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + '_' + file.name.replaceAll(' ', '_');
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    await writeFile(filepath, buffer);

    const bilde = await db.bilde.create({
      data: {
        url: `/uploads/${filename}`,
        beskrivelse,
        prosjektId,
      },
    });

    return NextResponse.json(bilde);
  } catch (error) {
    console.error('Feil ved opplasting av bilde:', error);
    return NextResponse.json({ error: 'Feil ved opplasting av bilde' }, { status: 500 });
  }
}