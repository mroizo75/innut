"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function EditUserModal({ user, onEdit }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    onEdit(formData)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Rediger</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger bruker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          <Input name="navn" defaultValue={user.navn} placeholder="Fornavn" />
          <Input name="etternavn" defaultValue={user.etternavn} placeholder="Etternavn" />
          <Input name="email" defaultValue={user.email} placeholder="E-post" type="email" />
          <Input name="position" defaultValue={user.position} placeholder="Stilling" />
          <select name="role" defaultValue={user.role} className="w-full p-2 border rounded">
            <option value="USER">Bruker</option>
            <option value="LEDER">Leder</option>
            <option value="PROSJEKLEDER">Prosjektleder</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Button type="submit">Lagre endringer</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}