"use client"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function DeleteUserButton({ userId, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(userId)
    } catch (error) {
      console.error("Feil ved sletting av bruker:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      onClick={handleDelete} 
      variant="destructive" 
      className="ml-2"
      disabled={isDeleting}
    >
      {isDeleting ? "Sletter..." : "Slett"}
    </Button>
  )
}