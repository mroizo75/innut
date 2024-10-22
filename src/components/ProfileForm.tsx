"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const profileSchema = z.object({
  navn: z.string().min(2, {
    message: "Navn må være minst 2 tegn.",
  }),
  etternavn: z.string().min(2, {
    message: "Etternavn må være minst 2 tegn.",
  }),
  email: z.string().email({
    message: "Ugyldig e-postadresse.",
  }),
  position: z.string().optional(),
  bildeUrl: z.string().url().optional().or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  user: Partial<User>
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user.bildeUrl || "")

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      navn: user.navn || "",
      etternavn: user.etternavn || "",
      email: user.email || "",
      position: user.position || "",
      bildeUrl: user.bildeUrl || "",
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)

    const response = await fetch("/api/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    setIsLoading(false)

    if (!response.ok) {
      return toast({
        title: "Noe gikk galt.",
        description: "Profiloppdateringen feilet. Vennligst prøv igjen.",
        variant: "destructive",
      })
    }

    toast({
      description: "Din profil har blitt oppdatert.",
    })

    router.refresh()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Opplasting feilet')
        }

        const data = await response.json()
        setAvatarUrl(data.url)
        form.setValue("bildeUrl", data.url)
        toast({
          description: "Profilbilde lastet opp.",
        })
      } catch (error) {
        console.error("Feil ved opplasting av bilde:", error)
        toast({
          title: "Feil ved bildeopplasting",
          description: "Kunne ikke laste opp bildet. Vennligst prøv igjen.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center space-x-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarUrl} alt={user.navn} />
          <AvatarFallback>{user.navn?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <FormField
            control={form.control}
            name="bildeUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profilbilde</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" onChange={handleFileUpload} className="cursor-pointer" />
                </FormControl>
                <FormDescription>
                  Last opp et nytt profilbilde.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
        <FormField
          control={form.control}
          name="navn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fornavn</FormLabel>
              <FormControl>
                <Input placeholder="Ola" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="etternavn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etternavn</FormLabel>
              <FormControl>
                <Input placeholder="Nordmann" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-post</FormLabel>
              <FormControl>
                <Input placeholder="ola.nordmann@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stilling</FormLabel>
              <FormControl>
                <Input placeholder="Utvikler" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Oppdaterer..." : "Oppdater profil"}
        </Button>
      </form>
    </Form>
  )
}