import { auth } from "@/auth"
import { db } from "@/lib/db"
import DashboardHeader from "@/components/DashboardHeader"
import { RapportDashboard } from "@/components/RapportDashboard"

const RapportPage = async () => {
  const session = await auth()
  const currentUser = await db.user.findUnique({
    where: { id: session?.user?.id },
  })

  if (!currentUser) {
    return <div>Bruker ikke funnet</div>
  }

  if (currentUser.role !== "ADMIN" && currentUser.role !== "LEDER") {
    return <div>Du har ikke tilgang til denne siden</div>
  }

  // Hent nødvendig data
  const prosjekter = await db.prosjekt.findMany({
    where: { bedriftId: currentUser.bedriftId },
  })

  const totalTimer = await db.timeEntry.aggregate({
    where: { prosjekt: { bedriftId: currentUser.bedriftId } },
    _sum: { hours: true },
  })

  const antallProsjekter = prosjekter.length
  const totaleTimer = totalTimer._sum.hours || 0

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      {/* Bruk klientkomponenten og send data som props */}
      <RapportDashboard
        antallProsjekter={antallProsjekter}
        totaleTimer={totaleTimer}
      />
    </div>
  )
}

export default RapportPage