import { db } from "@/lib/db"

interface TimeEntry {
  date: Date
  hours: number
  description: string
  userId: string
  prosjektId: string
}

export async function addTimeEntry(data: TimeEntry) {
  return await db.timeEntry.create({
    data,
  })
}

export async function getTimeEntriesByUser(userId: string) {
  return await db.timeEntry.findMany({
    where: { userId },
    include: { prosjekt: true },
    orderBy: { date: "desc" },
  })
}

export async function updateTimeEntry(id: string, data: TimeEntry) {
  return await db.timeEntry.update({
    where: { id },
    data,
  })
}

export async function deleteTimeEntry(id: string) {
  return await db.timeEntry.delete({
    where: { id },
  })
}