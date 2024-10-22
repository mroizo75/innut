import DashboardHeader from "@/components/DashboardHeader"
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
} from "lucide-react"

import { auth, signOut } from "@/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getUserById } from "@/data/user"
import bcrypt from 'bcryptjs'
import { EditUserModal } from '@/components/EditUserModal'
import { deleteUser, updateUser } from "@/data/user"
import { DeleteUserButton } from "@/components/DeleteUserButton"
import { AddUserModal } from '@/components/AddUserModal'
import { AddProsjektModal } from '@/components/AddProsjektModal'
import { TimeTrackingCard } from "@/components/TimeTrackingCard"
import { getUserByEmail } from "@/data/user"
import { createUser } from "@/data/user";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { redirect } from "next/navigation";
import { HoursPerProjectChart } from '@/components/HoursPerProjectChart';
import { UserRole } from "@prisma/client"

interface Prosjekt {
  id: string
  navn: string
  beskrivelse: string
  startDato: Date
  sluttDato: Date
  status: "IKKE_STARTET" | "STARTET" | "AVSLUTTET"
  bedriftId: string
} 





const AdminPage = async () => {
  const session = await auth();
  const currentUser = await db.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      oppgaver: {
        include: {
          prosjekt: true,
        },
      },
    },
  });
  const oppgaver = await db.oppgave.findMany({
    where: { prosjekt: { bedriftId: currentUser?.bedriftId } }, 
    include: { prosjekt: true, bruker: true },
    orderBy: { sluttDato: 'asc' },
    take: 10, // Begrens til de 10 første oppgavene
  });

  if (!currentUser) {
    redirect("/auth/login")
  }

  const users = await db.user.findMany({
    where: { bedriftId: currentUser?.bedriftId },
    include: { bedrift: true }
  });

  const prosjekter = await db.prosjekt.findMany({
    where: { bedriftId: currentUser?.bedriftId },
    include: {
      oppgaver: {
        select: {
          status: true
        }
      }
    }
  });

  const employeeCount = users.length;
  const activeProjects = prosjekter.filter(p => p.status === 'STARTET').length;
  const notStartedProjects = prosjekter.filter(p => p.status === 'IKKE_STARTET').length;
  const completedProjects = prosjekter.filter(p => p.status === 'AVSLUTTET').length;

  async function addUser(formData: FormData) {
    "use server"
  
    
    const session = await auth();
    const currentUser = await getUserById(session?.user?.id as string);
    
    if (currentUser?.role !== "ADMIN") {
      throw new Error("Bare administratorer kan legge til nye brukere");
    }
  
    const navn = formData.get("navn") as string
    const etternavn = formData.get("etternavn") as string
    const email = formData.get("email") as string
    const position = formData.get("position") as string
    const role = formData.get("role") as UserRole
  
    try {
      const existingUser = await getUserByEmail(email)
      if (existingUser) {
        return { error: "En bruker med denne e-postadressen eksisterer allerede" }
      }
  
      const user = await createUser({
        navn,
        etternavn,
        email,
        position,
        role: role || "USER",
        bedriftId: currentUser.bedriftId!,
        password: "", // Tom passord, vil bli satt av brukeren senere
      });
  
      if (!user.success) {
        throw new Error(user.error);
      }
  
      const passwordResetToken = await generatePasswordResetToken(email);
      await sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token,
        "Sett opp ditt passord"
      );
      const { token } = await generatePasswordResetToken(email);
      await sendPasswordResetEmail(
      email,
      token,
      "Sett opp ditt passord"
    );
    console.log("Passord-reset e-post sendt til:", email);
  
      revalidatePath("/admin")
      return { success: "Bruker lagt til. En e-post med lenke for å sette opp passord er sendt." }
    } catch (error) {
      console.error("Feil ved oppretting av bruker:", error)
      return { error: "Kunne ikke opprette bruker" }
    }
  }
  
  
  async function handleDelete(userId: string) {
    "use server"
    await deleteUser(userId)
    revalidatePath("/admin")
  }
  
  async function handleEdit(formData: FormData) {
    "use server"
    const userId = formData.get("userId") as string
    const navn = formData.get("navn") as string
    const etternavn = formData.get("etternavn") as string
    const email = formData.get("email") as string
    const position = formData.get("position") as string
    const role = formData.get("role") as "ADMIN" | "PROSJEKLEDER" | "LEDER" | "USER"
  
    await updateUser(userId, {
      navn,
      etternavn,
      email,
      position,
      role,
    })
  
    revalidatePath("/admin")
  }
  
  async function addProsjekt(formData: FormData) {
    "use server";
    
    const session = await auth();
    const currentUser = await getUserById(session?.user?.id as string);
    
    if (currentUser?.role !== "ADMIN") {
      throw new Error("Bare administratorer kan legge til nye prosjekter");
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
  
    revalidatePath("/admin");
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
      timer: item._sum.hours || 0,
    };
  })
);

// const prosjektOppgaveTelling = await db.oppgave.groupBy({
//   by: ['prosjektId', 'status'],
//   _count: {
//     _all: true
//   }
// });
// ;

const prosjektMedTelling = prosjekter.map(prosjekt => {
  const telling = prosjekt.oppgaver.reduce((acc, oppgave) => {
    acc.total++;
    acc[oppgave.status.toLowerCase() as keyof typeof acc]++;
    return acc;
  }, { total: 0, ikkestartet: 0, igang: 0, fullfort: 0 });

  return {
    ...prosjekt,
    oppgaveTelling: telling
  };
});

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
  <Card className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        Ansatte
      </CardTitle>
      <Users className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{employeeCount}</div>
      <p className="text-xs text-muted-foreground">
        Totalt antall ansatte
      </p>
    </CardContent>
  </Card>
  <Card className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        Aktive prosjekter
      </CardTitle>
      <Activity className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{activeProjects}</div>
      <p className="text-xs text-muted-foreground">
        Prosjekter som er i gang
      </p>
    </CardContent>
  </Card>
  <Card className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Planlagte prosjekter</CardTitle>
      <CreditCard className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{notStartedProjects}</div>
      <p className="text-xs text-muted-foreground">
        Prosjekter som ikke har startet
      </p>
    </CardContent>
  </Card>
  <Card className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Fullførte prosjekter</CardTitle>
      <DollarSign className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{completedProjects}</div>
      <p className="text-xs text-muted-foreground">
        Prosjekter som er ferdigstilt
      </p>
    </CardContent>
  </Card>
  <Card className="shadow-md">
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
        <div className="flex justify-between">
          <AddUserModal currentUser={currentUser} onAdd={addUser} />
          <AddProsjektModal currentUser={currentUser} onAdd={addProsjekt} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bedriftsbrukere</CardTitle>
            <CardDescription>Oversikt over alle brukere i bedriften</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Navn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Stilling</TableHead>
                  <TableHead>Bedrift</TableHead>
                  <TableHead>Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="mr-2 h-8 w-8">
                          <AvatarFallback>{user.navn.charAt(0)}{user.etternavn.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{`${user.navn} ${user.etternavn}`}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.position}</TableCell>
                    <TableCell>{user.bedrift.navn}</TableCell>
                    <TableCell className="flex items-center space-x-2">
                      <EditUserModal user={user} onEdit={handleEdit} />
                      <DeleteUserButton userId={user.id} onDelete={handleDelete} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <TimeTrackingCard currentUser={currentUser} />

        <Card>
        <Card>
  <CardHeader>
    <CardTitle>Siste oppgaver</CardTitle>
    <CardDescription>Oversikt over de siste 10 oppgavene i bedriften</CardDescription>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Oppgave</TableHead>
          <TableHead>Prosjekt</TableHead>
          <TableHead>Ansvarlig</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Frist</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {oppgaver.map((oppgave) => (
          <TableRow key={oppgave.id}>
            <TableCell>{oppgave.tittel}</TableCell>
            <TableCell>{oppgave.prosjekt.navn}</TableCell>
            <TableCell>{oppgave.bruker?.navn || 'Ukjent bruker'}</TableCell>
            <TableCell>{oppgave.status}</TableCell>
            <TableCell>{oppgave.sluttDato ? new Date(oppgave.sluttDato).toLocaleDateString() : 'Ikke satt'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
          <CardHeader>
            <CardTitle>Alle dashbord</CardTitle>
            <CardDescription>Tilgang til alle roller</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex lg:flex-row mb:flex-col justify-between gap-2 md:grid-cols-3">
              <a href="/admin" className="block p-4 border rounded hover:bg-gray-100">
                Admin Dashbord
              </a>
              <a href="/leder" className="block p-4 border rounded hover:bg-gray-100">
                Leder Dashbord
              </a>
              <a href="/prosjekt-leder" className="block p-4 border rounded hover:bg-gray-100">
                Prosjektleder Dashbord
              </a>
              <a href="/ansatt" className="block p-4 border rounded hover:bg-gray-100">
                Ansatt Dashbord
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default AdminPage