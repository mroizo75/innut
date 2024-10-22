import DashboardHeader from "@/components/DashboardHeader"
import { Activity, Users, CreditCard, DollarSign, Package2 } from "lucide-react"
import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { TimeTrackingCard } from "@/components/TimeTrackingCard"
import { HoursPerProjectChart } from '@/components/HoursPerProjectChart'
import { AddProsjektModal } from '@/components/AddProsjektModal'
import { Prosjekt, Oppgave } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { useTransition } from "react"

interface ProsjektMedTelling extends Prosjekt {
  oppgaver: { status: Oppgave['status'] }[];
  oppgaveTelling: {
    total: number;
    ikkestartet: number;
    igang: number;
    fullfort: number;
  };
}

async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null

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
  })

  return user
}

const ProsjektLederPage = async () => {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/auth/login")
  }

  if (currentUser.role !== "PROSJEKTLEDER" && currentUser.role !== "ADMIN") {
    redirect("/404")
  }

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

  const activeProjects = prosjekter.filter(p => p.status === 'STARTET').length
  const notStartedProjects = prosjekter.filter(p => p.status === 'IKKE_STARTET').length
  const completedProjects = prosjekter.filter(p => p.status === 'AVSLUTTET').length

  const prosjektMedTelling: ProsjektMedTelling[] = prosjekter.map(prosjekt => {
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

  const addProsjekt = async (formData: FormData) => {
    "use server";
    
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("Bruker ikke funnet");
    }

    if (currentUser.role !== "PROSJEKTLEDER" && currentUser.role !== "ADMIN") {
      throw new Error("Bare prosjektledere og administratorer kan legge til nye prosjekter");
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
  
    revalidatePath("/prosjekt-leder");
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale oppgaver</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {prosjektMedTelling.reduce((sum, p) => sum + p.oppgaveTelling.total, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Totalt antall oppgaver på tvers av alle prosjekter
              </p>
            </CardContent>
          </Card>
        </div>

        <HoursPerProjectChart />

        <div className="flex justify-end">
        <AddProsjektModal currentUser={currentUser} addProsjekt={addProsjekt.bind(null)} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prosjektoversikt</CardTitle>
            <CardDescription>Oversikt over alle prosjekter</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
              <TableRow>
                  <TableHead>Prosjektnavn</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Startdato</TableHead>
                  <TableHead>Sluttdato</TableHead>
                  <TableHead>Oppgaver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prosjektMedTelling.map((prosjekt) => (
                  <TableRow key={prosjekt.id}>
                    <TableCell>{prosjekt.navn}</TableCell>
                    <TableCell>{prosjekt.status}</TableCell>
                    <TableCell>{prosjekt.startDato.toLocaleDateString()}</TableCell>
                    <TableCell>{prosjekt.sluttDato.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div>Totalt: {prosjekt.oppgaveTelling.total}</div>
                      <div>Ikke startet: {prosjekt.oppgaveTelling.ikkestartet}</div>
                      <div>I gang: {prosjekt.oppgaveTelling.igang}</div>
                      <div>Fullført: {prosjekt.oppgaveTelling.fullfort}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <TimeTrackingCard currentUser={currentUser} />
      </main>
    </div>
  )
}

export default ProsjektLederPage