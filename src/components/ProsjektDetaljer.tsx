"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KanbanBoard } from './KanbanBoard'
import ProsjektTabell from "@/components/ProsjektTabell"
import ProsjektGantt from "@/components/ProsjektGantt"
import { AddOppgaveModal } from './AddOppgaveModal'
import { EditOppgaveModal } from './EditOppgaveModal'
import { oppdaterOppgaveStatus, slettOppgave, leggTilOppgave, redigerOppgave } from '@/actions/oppgave'

const ProsjektDetaljer = ({ prosjekt: initialProsjekt, currentUser }) => {
  const [activeTab, setActiveTab] = useState("kanban")
  const [prosjekt, setProsjekt] = useState(initialProsjekt)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [oppgaveTilRedigering, setOppgaveTilRedigering] = useState(null)

  useEffect(() => {
    setProsjekt(initialProsjekt)
  }, [initialProsjekt])

  const handleAddOppgave = (nyOppgave) => {
    setProsjekt(prevProsjekt => ({
      ...prevProsjekt,
      oppgaver: [...prevProsjekt.oppgaver, nyOppgave]
    }))
  }

  const handleEditOppgave = async (oppgaveData) => {
    try {
      const response = await fetch(`/api/oppgaver/${oppgaveData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oppgaveData),
      });

      if (response.ok) {
        const oppdatertOppgave = await response.json();

        // Oppdater prosjektets oppgaver
        setProsjekt((prevProsjekt) => ({
          ...prevProsjekt,
          oppgaver: prevProsjekt.oppgaver.map((oppgave) =>
            oppgave.id === oppdatertOppgave.id ? oppdatertOppgave : oppgave
          ),
        }));

        setIsEditModalOpen(false);
      } else {
        const errorData = await response.json();
        console.error('Feil ved oppdatering av oppgave:', errorData.error);
        // Håndter feil, f.eks. vis en feilmelding
      }
    } catch (error) {
      console.error('Feil ved oppdatering av oppgave:', error);
      // Håndter feil
    }
  };

  const handleDeleteOppgave = async (oppgaveId) => {
    try {
      await slettOppgave(oppgaveId)
      setProsjekt(prevProsjekt => ({
        ...prevProsjekt,
        oppgaver: prevProsjekt.oppgaver.filter(oppgave => oppgave.id !== oppgaveId)
      }))
    } catch (error) {
      console.error("Feil ved sletting av oppgave:", error)
    }
  }

  const handleStatusChange = async (oppgaveId, nyStatus) => {
    try {
      await oppdaterOppgaveStatus(oppgaveId, nyStatus)
      setProsjekt(prevProsjekt => ({
        ...prevProsjekt,
        oppgaver: prevProsjekt.oppgaver.map(oppgave => 
          oppgave.id === oppgaveId ? { ...oppgave, status: nyStatus } : oppgave
        )
      }))
    } catch (error) {
      console.error("Feil ved oppdatering av oppgavestatus:", error)
    }
  }

  const handleOpenEditModal = (oppgave) => {
    setOppgaveTilRedigering(oppgave);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex flex-col space-y-4">
      
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="kanban">Kanban tavle</TabsTrigger>
          <TabsTrigger value="tabell">Liste</TabsTrigger>
          <TabsTrigger value="gantt">Tidslinje</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban">
          <KanbanBoard 
            prosjekt={prosjekt} 
            currentUser={currentUser} 
            onEditOppgave={handleOpenEditModal}
            onDeleteOppgave={handleDeleteOppgave}
            onStatusChange={handleStatusChange}
            onSaveOppgave={handleEditOppgave}
          />
        </TabsContent>
        <TabsContent value="tabell">
          <ProsjektTabell 
            prosjekt={prosjekt} 
            currentUser={currentUser} 
            onEditOppgave={(oppgave) => {
              setOppgaveTilRedigering(oppgave)
              setIsEditModalOpen(true)
            }}
            onDeleteOppgave={handleDeleteOppgave}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>
        <TabsContent value="gantt">
          <ProsjektGantt prosjekt={prosjekt} />
        </TabsContent>
      </Tabs>

          <AddOppgaveModal
      prosjektId={prosjekt.id}
        onAdd={handleAddOppgave}
        currentUser={currentUser}
      />
        {isEditModalOpen && oppgaveTilRedigering && (
        <EditOppgaveModal
            isOpen={isEditModalOpen}
            onClose={() => {
            setIsEditModalOpen(false);
            setOppgaveTilRedigering(null);
            }}
            oppgave={oppgaveTilRedigering}
            onEdit={handleEditOppgave}
            currentUser={currentUser}
        />
      )}
    </div>
  )
}

export default ProsjektDetaljer
