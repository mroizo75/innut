import { auth } from "@/auth";
import { db } from "@/lib/db";
import SkjemaBoard from "@/components/SkjemaBoard";
import DashboardHeader from "@/components/DashboardHeader";
import { redirect } from "next/navigation";

async function getSkjemaer(bedriftId: string) {
  if (!bedriftId) {
    throw new Error('BedriftId er ikke definert');
  }

  // Hent avviksskjemaer
  const avvikSkjemaer = await db.skjema.findMany({
    where: { bedriftId, type: 'avvik', status: { not: 'Arkivert' } },
    select: {
      id: true,
      type: true, // Legg til denne linjen
      tittel: true,
      innhold: true,
      status: true,
      opprettetDato: true,
      solution: true,
      notes: true,
      behandler: { select: { navn: true, etternavn: true } },
      opprettetAv: { select: { navn: true, etternavn: true } },
    },
    orderBy: { opprettetDato: 'desc' },
  });

  // Legg til 'type' på avviksskjemaene
  const formattedAvvikSkjemaer = avvikSkjemaer.map(skjema => ({
    ...skjema,
  }));

  // Hent endringsskjemaer
  const endringsSkjemaer = await db.endringsSkjema.findMany({
    where: { bedriftId, status: { not: 'Arkivert' } },
    select: {
      id: true,
      type: true, // Legg til denne linjen
      changeNumber: true,
      projectName: true,
      description: true,
      implementationDate: true,
      opprettetDato: true,
      status: true,
      solution: true,
      behandler: { select: { navn: true, etternavn: true } },
      opprettetAv: { select: { navn: true, etternavn: true } },
    },
    orderBy: { opprettetDato: 'desc' },
  });

  // Legg til 'type' på endringsskjemaene
  const formattedEndringsSkjemaer = endringsSkjemaer.map(skjema => ({
    ...skjema,
  }));

  // Hent SJA-skjemaer
  const sjaSkjemaer = await db.sJASkjema.findMany({
    where: { bedriftId, status: { not: 'Arkivert' } },
    select: {
      id: true,
      type: true, // Legg til denne linjen
      jobTitle: true,
      jobLocation: true,
      status: true,
      comments: true,
      opprettetDato: true,
      behandler: { select: { navn: true, etternavn: true } },
      opprettetAv: { select: { navn: true, etternavn: true } },
    },
    orderBy: { opprettetDato: 'desc' },
  });
  // Legg til 'type' og 'innhold' på SJA-skjemaene
  const formattedSJASkjemaer = sjaSkjemaer.map(skjema => ({
    ...skjema,
    innhold: {
      jobTitle: skjema.jobTitle || '',
      jobLocation: skjema.jobLocation || '',
    },
    solution: skjema.comments || '',
  }));

  // Kombiner alle skjemaer
  return [
    ...formattedAvvikSkjemaer,
    ...formattedEndringsSkjemaer,
    ...formattedSJASkjemaer,
  ];
}

export default async function SkjemaBoardPage() {
  const session = await auth()
  if (!session || !session.user) {
    redirect("/auth/login")
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: { bedrift: true },
  })

  if (!currentUser) {
    redirect("/auth/login")
  }

  const alleSkjemaer = await getSkjemaer(session.user.bedriftId);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <h1 className="text-3xl font-bold mb-8">Skjemaoversikt</h1>
        <SkjemaBoard skjemaer={alleSkjemaer} currentUser={session.user} />
      </main>
    </div>
  );
}