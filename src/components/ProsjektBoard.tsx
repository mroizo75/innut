"use client"

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Oppgave, OppgaveStatus, User } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import OppgaveModal from '@/components/OppgaveModal'

interface ProsjektBoardProps {
  prosjekt: any
  currentUser: User
}

const ProsjektBoard: React.FC<ProsjektBoardProps> = ({ prosjekt, currentUser }) => {
  const [oppgaver, setOppgaver] = useState(prosjekt.oppgaver)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentOppgave, setCurrentOppgave] = useState<Oppgave | null>(null)

  const onDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    if (source.droppableId !== destination.droppableId) {
      const nyStatus = destination.droppableId as OppgaveStatus
      const oppgaveId = result.draggableId

      // Oppdater oppgavestatus i backend
      const response = await fetch(`/api/oppgaver/${oppgaveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nyStatus }),
      })

      if (response.ok) {
        // Oppdater lokal state
        const nyeOppgaver = [...oppgaver]
        const [reorderedItem] = nyeOppgaver.splice(source.index, 1)
        reorderedItem.status = nyStatus
        nyeOppgaver.splice(destination.index, 0, reorderedItem)
        setOppgaver(nyeOppgaver)
      }
    }
  }

  const handleAddOppgave = () => {
    setCurrentOppgave(null)
    setIsModalOpen(true)
  }

  const handleEditOppgave = (oppgave: Oppgave) => {
    setCurrentOppgave(oppgave)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentOppgave(null)
  }

  const handleSaveOppgave = async (oppgaveData: Partial<Oppgave>) => {
    if (currentOppgave) {
      // Oppdater eksisterende oppgave
      const response = await fetch(`/api/oppgaver/${currentOppgave.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oppgaveData),
      })

      if (response.ok) {
        const oppdatertOppgave = await response.json()
        setOppgaver(oppgaver.map((o: Oppgave) => o.id === oppdatertOppgave.id ? oppdatertOppgave : o))
        handleCloseModal()
      } else {
        const errorData = await response.json()
        console.error('Feil ved oppdatering av oppgave:', errorData.error)
        // Vis en feilmelding til brukeren
      }
    } else {
      // Opprett ny oppgave
      const response = await fetch('/api/oppgaver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...oppgaveData, prosjektId: prosjekt.id }),
      })

      if (response.ok) {
        const nyOppgave = await response.json()
        setOppgaver([...oppgaver, nyOppgave])
      }

      handleCloseModal()
    }
  }

  const handleDeleteOppgave = async (oppgaveId: string) => {
    const response = await fetch(`/api/oppgaver/${oppgaveId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      setOppgaver(oppgaver.filter((o: Oppgave) => o.id !== oppgaveId))
    }
  }

  return (
    <div>
      <Button onClick={handleAddOppgave} className="mb-4">
        <Plus className="mr-2 h-4 w-4" /> Legg til oppgave
      </Button>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(OppgaveStatus).map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <Card {...provided.droppableProps} ref={provided.innerRef}>
                  <CardHeader>
                    <CardTitle>{status}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {oppgaver
                      .filter((oppgave: Oppgave) => oppgave.status === status)
                      .map((oppgave: Oppgave, index: number) => (
                        <Draggable key={oppgave.id} draggableId={oppgave.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-4 mb-2 rounded shadow"
                            >
                              <h3 className="font-bold">{oppgave.tittel}</h3>
                              <p>{oppgave.beskrivelse}</p>
                              <div className="mt-2">
                                <Button onClick={() => handleEditOppgave(oppgave)} variant="outline" size="sm" className="mr-2">
                                  Rediger
                                </Button>
                                <Button onClick={() => handleDeleteOppgave(oppgave.id)} variant="destructive" size="sm">
                                  Slett
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </CardContent>
                </Card>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      <OppgaveModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveOppgave}
        oppgave={currentOppgave}
      />
    </div>
  )
}

export default ProsjektBoard
