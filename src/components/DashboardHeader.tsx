"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "@prisma/client"
import Image from "next/image"

export default function DashboardHeader({ currentUser }: { currentUser: User }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!currentUser) {
    return null
  }

  const menuItems = [
    { label: "Hjem", href: `/${currentUser.role.toLowerCase()}`, roles: ["ADMIN", "LEDER", "PROSJEKTLEDER", "USER"] },
    { label: "Prosjekter", href: "/prosjekter", roles: ["ADMIN", "LEDER", "PROSJEKTLEDER"] },
    { label: "Ansatte", href: "/ansatte", roles: ["ADMIN", "LEDER"] },
    { label: "Skjemabehandling", href: "/skjemaboard", roles: ["ADMIN", "LEDER"] },
    { label: 'Timer per Oppgave', href: '/timer-per-oppgave', roles: ['ADMIN', 'LEDER', 'PROSJEKTLEDER'] },
    { label: "HMS", href: "/hms", roles: ["ADMIN", "LEDER", "PROSJEKTLEDER", "USER"] },
    // { label: "Mine Oppgaver", href: "/oppgaver", roles: ["ADMIN", "LEDER", "PROSJEKTLEDER", "USER"] },
  ]

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(currentUser.role))

  return (
    <header className="bg-white dark:bg-black border-b">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href={`/${currentUser.role.toLowerCase()}`} className="flex items-center space-x-3">
          <Image src="/images/logo_innut.png" alt="Logo" width={150} height={75} className="dark:invert"/> 
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Dashboard</span>
        </Link>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        >
          <span className="sr-only">Åpne hovedmeny</span>
          <Menu className="h-6 w-6" />
        </button>
        <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            {filteredMenuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-full border border-gray-200 w-8 h-8 dark:border-gray-800"
                size="icon"
                variant="ghost"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage alt="User avatar" src={currentUser.bildeUrl || "/placeholder-avatar.jpg"} />
                  <AvatarFallback>{currentUser.navn?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Åpne brukermeny</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{currentUser.navn}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profil">Profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/innstillinger">Innstillinger</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/auth/logout">Logg ut</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}