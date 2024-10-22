import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deleteFile } from '@/lib/googleCloudStorage';

export async function POST(request: Request) {
  const { filId } = await request.json();

  if (!filId) {
    return NextResponse.json({ error: 'Ugyldig data' }, { status: 400 });
  }

  try {
    const fil = await db.fil.findUnique({
      where: { id: filId },
    });

    if (!fil) {
      return NextResponse.json({ error: 'Filen ble ikke funnet' }, { status: 404 });
    }

    // Ekstraher filnavnet fra URL-en
    const fileName = fil.url.split('/').pop();

    if (!fileName) {
      throw new Error('Kunne ikke finne filnavnet');
    }

    // Slett filen fra Google Cloud Storage
    await deleteFile(fileName);

    // Slett filen fra databasen
    await db.fil.delete({
      where: { id: filId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feil ved sletting av fil:', error);
    return NextResponse.json({ error: 'Feil ved sletting av fil' }, { status: 500 });
  }
}