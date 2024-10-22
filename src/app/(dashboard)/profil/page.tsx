import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/ProfileForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardHeader from "@/components/DashboardHeader"

async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      navn: true,
      etternavn: true,
      position: true,
      bildeUrl: true,
      role: true,
    }
  })

  return user
}

export default async function ProfilPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex-1 p-6">
        <div className="container mx-auto"> 
          <h1 className="text-3xl font-bold mb-6">Min Profil</h1>
          <Card>
            <CardHeader>
              <CardTitle>Profilinformasjon</CardTitle>
              <CardDescription>Oppdater din personlige informasjon her.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={currentUser} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}