import { auth } from "@/auth";
import { db } from "@/lib/db";
import DashboardHeader from "@/components/DashboardHeader";
import { ProsjekterClient } from "./ProsjekterClient";
import { redirect } from "next/navigation";
import { AddProsjektModal } from "@/components/AddProsjektModal";
import { revalidatePath } from "next/cache";
import { OppgaveStatus } from "@/utils/status-mapper";

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      oppgaver: {
        include: {
          prosjekt: true,
        },
      },
      bedrift: true,
    },
  });

  return user;
}

async function getProsjekter(bedriftId: string) {
  const prosjekter = await db.prosjekt.findMany({
    where: {
      bedriftId: bedriftId,
      
    },
    include: {
      oppgaver: {
        select: {
          status: true,
        },
      },
    },
  });

  return prosjekter;
}

export default async function ProsjekterPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  if (currentUser.role !== "LEDER" && currentUser.role !== "ADMIN" && currentUser.role !== "PROSJEKTLEDER") {
    redirect("/404");
  }

  const prosjekter = await getProsjekter(currentUser.bedriftId);

  const prosjektMedTelling = prosjekter.map((prosjekt) => {
    const telling: { [key in OppgaveStatus]: number } = {
      [OppgaveStatus.IKKE_STARTET]: 0,
      [OppgaveStatus.I_GANG]: 0,
      [OppgaveStatus.FULLFORT]: 0,
    };

    prosjekt.oppgaver.forEach((oppgave) => {
      if (telling[oppgave.status as OppgaveStatus] !== undefined) {
        telling[oppgave.status as OppgaveStatus]++;
      } else {
        console.warn(`Ukjent status: ${oppgave.status}`);
      }
    });

    return {
      ...prosjekt,
      oppgaveTelling: {
        total: prosjekt.oppgaver.length,
        ...telling,
      },
    };
  });

   // Definer addProsjektAction-funksjonen
   const addProsjektAction = async (formData: FormData) => {
    "use server";

    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Bruker ikke autentisert");
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      throw new Error("Bruker ikke funnet");
    }

    if (currentUser.role !== "LEDER" && currentUser.role !== "ADMIN" && currentUser.role !== "PROSJEKTLEDER") {
      throw new Error("Du har ikke tilgang til å opprette prosjekter");
    }

    const navn = formData.get("navn") as string;
    const beskrivelse = formData.get("beskrivelse") as string;
    const startDato = new Date(formData.get("startDato") as string);
    const sluttDato = new Date(formData.get("sluttDato") as string);
    const status = formData.get("status") as string || "IKKE_STARTET";

    await db.prosjekt.create({
      data: {
        navn,
        beskrivelse,
        startDato,
        sluttDato,
        status,
        bedrift: {
          connect: {
            id: currentUser.bedriftId,
          },
        },
      },
    });

    // Revalidér siden slik at det nye prosjektet vises
    revalidatePath("/prosjekter");
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex-grow container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Prosjektoversikt</h1>
          <AddProsjektModal currentUser={currentUser} addProsjektAction={addProsjektAction} />
        </div>
        <ProsjekterClient initialProsjekter={prosjektMedTelling} currentUser={currentUser} />
      </main>
    </div>
  );
}
