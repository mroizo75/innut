import DashboardHeader from "@/components/DashboardHeader"
import { Activity, Users, CreditCard, DollarSign, Package2 } from "lucide-react"
import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { TimeTrackingCard } from "@/components/TimeTrackingCard"
import { HoursPerProjectChart } from '@/components/HoursPerProjectChart'
import { AddProsjektModal } from '@/components/AddProsjektModal'
import { revalidatePath } from "next/cache"
import { getUserById } from "@/data/user"


const LederPage = async () => {
  const session = await auth()
  const currentUser = await db.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      oppgaver: {
        include: {
          prosjekt: true,
        },
      },
    },
  })

  if (!currentUser) {
    redirect("/auth/login")
  }

  if (currentUser.role !== "LEDER" && currentUser.role !== "ADMIN") {
    redirect("/404")
  }

  const users = await db.user.findMany({
    where: { bedriftId: currentUser.bedriftId },
    include: { bedrift: true }
  })

  const prosjekter = await db.prosjekt.findMany({
    where: { bedriftId: currentUser.bedriftId },
    include: {
      oppgaver: {
        select: {
          status: true
        }
      }
    }
  })

  const employeeCount = users.length
  const activeProjects = prosjekter.filter(p => p.status === 'STARTET').length
  const notStartedProjects = prosjekter.filter(p => p.status === 'IKKE_STARTET').length
  const completedProjects = prosjekter.filter(p => p.status === 'AVSLUTTET').length

  const prosjektMedTelling = prosjekter.map(prosjekt => {
    const telling = prosjekt.oppgaver.reduce((acc, oppgave) => {
      acc.total++
      acc[oppgave.status.toLowerCase() as keyof typeof acc]++
      return acc
    }, { total: 0, ikkestartet: 0, igang: 0, fullfort: 0 })

    return {
      ...prosjekt,
      oppgaveTelling: telling
    }
  })


  async function addProsjekt(formData: FormData) {
    "use server";
    
    const session = await auth();
    const currentUser = await getUserById(session?.user?.id as string);
    
    if (currentUser?.role !== "LEDER" && currentUser?.role !== "ADMIN") {
      throw new Error("Bare ledere og administratorer kan legge til nye prosjekter");
    }
  
    const navn = formData.get("navn") as string;
    const beskrivelse = formData.get("beskrivelse") as string; // Hvis dette feltet brukes
    const startDato = new Date(formData.get("startDato") as string);
    const sluttDato = new Date(formData.get("sluttDato") as string);
  
    await db.prosjekt.create({
      data: {
        navn,
        beskrivelse,
        startDato,
        sluttDato,
        bedrift: {
          connect: {
            id: currentUser.bedriftId,
          },
        },
      },
    });
  
    revalidatePath("/leder");
  }
  
  

// Etter at du har hentet currentUser og prosjekter
const prosjektTimer = await db.timeEntry.groupBy({
  by: ['prosjektId'],
  _sum: {
    hours: true,
  },
  where: {
    brukerId: currentUser.id,
  },
});

const chartData = await Promise.all(
  prosjektTimer.map(async (item) => {
    const prosjekt = await db.prosjekt.findUnique({
      where: { id: item.prosjektId },
      select: { navn: true },
    });
    return {
      prosjektNavn: prosjekt?.navn || 'Ukjent',
      timer: item._sum.timer || 0,
    };
  })
);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ansatte</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeeCount}</div>
              <p className="text-xs text-muted-foreground">Totalt antall ansatte</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive prosjekter</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">Prosjekter som er i gang</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planlagte prosjekter</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notStartedProjects}</div>
              <p className="text-xs text-muted-foreground">Prosjekter som ikke har startet</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fullførte prosjekter</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProjects}</div>
              <p className="text-xs text-muted-foreground">Prosjekter som er ferdigstilt</p>
            </CardContent>
          </Card>
        </div>

        <HoursPerProjectChart  />

        <div className="flex justify-between">
          <AddProsjektModal currentUser={currentUser} onAdd={addProsjekt} />
        </div>

        <TimeTrackingCard currentUser={currentUser} />
      </main>
    </div>
  )
}

export default LederPage