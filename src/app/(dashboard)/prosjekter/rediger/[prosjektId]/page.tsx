// src/app/(dashboard)/prosjekter/rediger/[prosjektId]/page.tsx

import { auth } from "@/auth";
import { db } from "@/lib/db";
import DashboardHeader from "@/components/DashboardHeader";
import RedigerProsjektForm from "@/components/RedigerProsjektForm";
import { notFound } from "next/navigation";

interface Prosjekt {
  id: string;
  navn: string;
  beskrivelse: string;
  startDato: string;
  sluttDato: string;
}

const RedigerProsjektPage = async ({ params }: { params: { prosjektId: string } }) => {
  const session = await auth();
  const currentUser = session?.user;
  const prosjektId = params.prosjektId;

  const prosjekt = await db.prosjekt.findUnique({
    where: { id: prosjektId },
    select: {
      id: true,
      navn: true,
      beskrivelse: true,
      startDato: true,
      sluttDato: true,
    },
  });

  if (!prosjekt) {
    return notFound();
  }

  // Konverter datoer til ISO-strenger
  const prosjektData = {
    ...prosjekt,
    startDato: prosjekt.startDato.toISOString(),
    sluttDato: prosjekt.sluttDato.toISOString(),
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <h1 className="text-3xl font-bold mb-6">Rediger Prosjekt</h1>
        <RedigerProsjektForm prosjekt={prosjektData} />
      </main>
    </div>
  );
};

export default RedigerProsjektPage;