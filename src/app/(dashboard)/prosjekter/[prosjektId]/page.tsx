import { auth } from "@/auth"
import { getUserById } from "@/data/user"
import { db } from "@/lib/db"
import DashboardHeader from "@/components/DashboardHeader"
import ProsjektDetaljer from "@/components/ProsjektDetaljer"
import { revalidatePath } from 'next/cache';

const ProsjektDetaljPage = async ({ params }: { params: { prosjektId: string } }) => {
  const session = await auth();
  const currentUser = await getUserById(session?.user?.id as string);

  if (!currentUser) {
    return <div>Bruker ikke funnet</div>
  }

  const prosjekt = await db.prosjekt.findUnique({
    where: { id: params.prosjektId },
    include: {
      oppgaver: {
        include: {
          bruker: {
            select: {
              navn: true,
              etternavn: true,
              bildeUrl: true,
            }
          },
          kommentarer: {
            include: {
              bruker: {
                select: {
                  navn: true,
                  bildeUrl: true,
                }
              }
            }
          },
          filer: true
        }
      }
    }
  });

  if (!prosjekt) {
    return <div>Prosjekt ikke funnet</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <h1 className="text-3xl font-bold mb-6">{prosjekt.navn}</h1>
        <ProsjektDetaljer prosjekt={prosjekt} currentUser={currentUser} />
      </main>
    </div>
  )
}

export default ProsjektDetaljPage
