import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import OppgaveList from "@/components/OppgaveList"
import DashboardHeader from "@/components/DashboardHeader"

const OppgaverPage = async () => {
  const session = await auth()
  if (!session) {
    redirect("/auth/login")
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      oppgaver: {
        include: {
          prosjekt: true,
        },
      },
    },
  });

  const oppgaver = await db.oppgave.findMany({
    where: {
      brukerId: session.user.id
    },
    include: {
      prosjekt: true,
      kommentarer: {
        include: {
          bruker: true
        }
      },
      filer: true
    },
    orderBy: {
      sluttDato: 'asc'
    }
  })

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Mine Oppgaver</h1>
        <OppgaveList oppgaver={oppgaver} userId={session.user.id} />
      </main>
    </div>
  )
}

export default OppgaverPage