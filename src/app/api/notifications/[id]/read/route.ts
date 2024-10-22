import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
  }

  const notificationId = params.id;

  await db.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return NextResponse.json({ message: 'Varselet er markert som lest' });
}