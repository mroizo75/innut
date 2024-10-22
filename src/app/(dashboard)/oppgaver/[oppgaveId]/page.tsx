import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/DashboardHeader"
import OppgaveDetaljer from "@/components/OppgaveDetaljer"

const OppgaveDetaljerPage = async ({ params }) => {
  const session = await auth()
  if (!session) {
    redirect("/auth/login")
  }

  const oppgave = await db.oppgave.findUnique({
    where: { id: params.oppgaveId },
    include: {
      prosjekt: true,
      bruker: true,
      kommentarer: {
        include: { bruker: true },
        orderBy: { opprettetAt: 'desc' },
      },
      filer: true,
    },
  })

  if (!oppgave) {
    redirect("/oppgaver")
  }

  // Sjekk at brukeren har tilgang til denne oppgaven
  if (oppgave.brukerId !== session.user.id) {
    redirect("/oppgaver")
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
  })

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex-grow container mx-auto p-4">
        <OppgaveDetaljer oppgave={oppgave} currentUser={currentUser} />
      </main>
    </div>
  )
}

export default OppgaveDetaljerPage