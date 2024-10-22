import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 });
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      bedrift: true,
    },
  });

  if (!currentUser) {
    return NextResponse.json({ error: 'Bruker ikke funnet' }, { status: 404 });
  }

  // Hent alle prosjekter tilknyttet bedriften
  const prosjekter = await db.prosjekt.findMany({
    where: {
      bedriftId: currentUser.bedriftId,
    },
  });

  // Hent timeoppføringer gruppert per prosjekt
  const prosjektTimer = await db.timeEntry.groupBy({
    by: ['prosjektId'],
    _sum: {
      hours: true,
    },
    where: {
      prosjektId: {
        in: prosjekter.map((prosjekt) => prosjekt.id),
      },
    },
  });

  // Bygg datalisten med nødvendig informasjon
  const data = await Promise.all(
    prosjektTimer.map(async (item) => {
      const prosjekt = prosjekter.find((p) => p.id === item.prosjektId);
      return {
        prosjektNavn: prosjekt?.navn || 'Ukjent',
        timer: item._sum.hours || 0,
        prosjektId: prosjekt?.id || '',
        bedriftId: currentUser.bedriftId,
        bedriftNavn: currentUser.bedrift.navn,
      };
    })
  );

  return NextResponse.json(data);
}
