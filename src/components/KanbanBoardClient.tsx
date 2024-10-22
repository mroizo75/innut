
import { useState, FC, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddOppgaveModal } from "@/components/AddOppgaveModal"
import { EditOppgaveModal } from "@/components/EditOppgaveModal"
import { oppdaterOppgaveStatus } from "@/actions/oppgave";
import { KommentarSection } from "@/components/KommentarSection"
import { PencilIcon } from "@heroicons/react/24/solid"; // Hvis du bruker Heroicons
import { FolderIcon } from "@heroicons/react/24/solid"; // Hvis du bruker Heroicons
import { UploadFileModal } from "@/components/UploadFileModal"
import { OppgaveStatus } from "@/utils/status-mapper";

// Definer typer for oppgaver, prosjekt, bruker osv.
interface Fil {
  id: string;
  url: string;
  navn: string;
}

interface Bruker {
  navn: string;
  etternavn: string;
}

interface Oppgave {
  id: string;
  tittel: string;
  beskrivelse: string;
  status: OppgaveStatus;
  bruker?: Bruker;
  filer?: Fil[];
  filUrl?: string;
  kommentarer?: any[]; // Du kan spesifisere riktig type hvis du har den
  opprettetDato: Date;
  startDato: Date;
  sluttDato: Date;
}

interface Prosjekt {
  id: string;
  oppgaver: Oppgave[];
}

interface KanbanBoardProps {
  prosjekt: Prosjekt;
  currentUser: any; // Spesifiser riktig type for currentUser hvis du har den
}

const columns = [
  OppgaveStatus.IKKE_STARTET,
  OppgaveStatus.I_GANG,
  OppgaveStatus.FULLFORT,
];

export const KanbanBoardClient: FC<KanbanBoardProps> = ({ prosjekt, currentUser, focusedOppgaveId }) => {
  const [oppgaver, setOppgaver] = useState<Oppgave[]>(prosjekt.oppgaver || [])
  const [oppgaveTilRedigering, setOppgaveTilRedigering] = useState<Oppgave | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)

  const [oppgaveTelling, setOppgaveTelling] = useState({
    total: oppgaver.length,
    ikkeStartet: oppgaver.filter(o => o.status === "Ikke startet").length,
    iGang: oppgaver.filter(o => o.status === "I gang").length,
    fullfort: oppgaver.filter(o => o.status === "Fullført").length
  });
  
  useEffect(() => {
    setOppgaveTelling({
      total: oppgaver.length,
      ikkeStartet: oppgaver.filter(o => o.status === "Ikke startet").length,
      iGang: oppgaver.filter(o => o.status === "I gang").length,
      fullfort: oppgaver.filter(o => o.status === "Fullført").length
    });
  }, [oppgaver]);

  useEffect(() => {
    if (focusedOppgaveId) {
      const oppgaveElement = document.getElementById(`oppgave-${focusedOppgaveId}`);
      if (oppgaveElement) {
        oppgaveElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        oppgaveElement.classList.add('ring-2', 'ring-blue-500');
      }
    }
  }, [focusedOppgaveId]);

  // Ny state for å holde styr på utvidet oppgave
  const [expandedOppgaveId, setExpandedOppgaveId] = useState<string | null>(null);

  // Tilstander for opplastingsmodalen
  const [oppgaveForOpplasting, setOppgaveForOpplasting] = useState<Oppgave | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const onDragEnd = async (result: DropResult) => {
    try {
      const { destination, source, draggableId } = result;
  
      if (!destination) {
        return;
      }
  
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }
  
      const oppgaveId = draggableId;
      const nyStatus = destination.droppableId;
  
      // Oppdater statusen i databasen
      await oppdaterOppgaveStatus(oppgaveId, nyStatus);
  
      // Oppdater statusen lokalt og bevar andre egenskaper
      setOppgaver((prevOppgaver) =>
        prevOppgaver.map((oppgave) =>
          oppgave.id === oppgaveId
            ? { ...oppgave, status: nyStatus }
            : oppgave
        )
      );
    } catch (error) {
      console.error('Feil ved oppdatering av oppgavestatus:', error);
      alert('Kunne ikke oppdatere oppgavestatus. Vennligst prøv igjen.');
    }
  };
  const handleEdit = (oppgave: Oppgave) => {
    setOppgaveTilRedigering(oppgave)
    setIsEditModalOpen(true)
  };

  const handleUpload = (oppgave: Oppgave) => {
    setOppgaveForOpplasting(oppgave);
    setIsUploadModalOpen(true);
  };

  const handleFileUpload = async (formData: FormData) => {
    try {
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      });
      const oppdatertOppgave: Oppgave = await response.json();

      if (!response.ok) {
        throw new Error((oppdatertOppgave as any).error || 'Feil ved opplasting av fil');
      }

      // Oppdater oppgavelisten med den oppdaterte oppgaven
      setOppgaver((prevOppgaver) =>
        prevOppgaver.map((oppg) =>
          oppg.id === oppdatertOppgave.id ? oppdatertOppgave : oppg
        )
      );
    } catch (error) {
      console.error('Feil ved opplasting av fil:', error);
      alert('Feil ved opplasting av fil: ' + (error as Error).message);
    }
  };

  const handleDeleteFile = async (filId: string, oppgaveId: string) => {
    if (confirm('Er du sikker på at du vil slette denne filen?')) {
      try {
        const response = await fetch('/api/slett-fil', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filId }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Feil ved sletting av fil');
        }

        // Oppdater oppgavelisten med den oppdaterte oppgaven
        setOppgaver((prevOppgaver) =>
          prevOppgaver.map((oppgave) =>
            oppgave.id === oppgaveId
              ? {
                  ...oppgave,
                  filer: oppgave.filer?.filter((fil) => fil.id !== filId),
                }
              : oppgave
          )
        );
      } catch (error) {
        console.error('Feil ved sletting av fil:', error);
        alert('Feil ved sletting av fil: ' + (error as Error).message);
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-4">
        {columns.map((column) => (
          <Droppable key={column} droppableId={column}>
            {(provided) => (
              <Card className="w-full md:w-1/3">
                <CardHeader>
                  <CardTitle>{column}</CardTitle>
                </CardHeader>
                <CardContent 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="min-h-[500px]"
                >
                  {oppgaver
                    .filter((oppgave) => oppgave.status === column)
                    .map((oppgave, index) => (
                      <Draggable key={oppgave.id} draggableId={oppgave.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 rounded-md shadow mb-2 cursor-pointer"
                            onClick={() =>
                              setExpandedOppgaveId(
                                expandedOppgaveId === oppgave.id ? null : oppgave.id
                              )
                            }
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold">{oppgave.tittel}</h3>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpload(oppgave);
                                  }}
                                >
                                  <FolderIcon className="w-5 h-5 text-gray-500" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(oppgave);
                                  }}
                                >
                                  <PencilIcon className="w-5 h-5 text-gray-500" />
                                </button>
                              </div>
                            </div>
                            {expandedOppgaveId === oppgave.id && (
                              <>
                                <p className="text-sm text-gray-600">{oppgave.beskrivelse}</p>
                                <p className="text-sm text-gray-600">
                                  Ansvarlig: {oppgave.bruker?.navn} {oppgave.bruker?.etternavn}
                                </p>
                                {oppgave.filUrl && (
                                  <a
                                    href={oppgave.filUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline text-sm"
                                  >
                                    Last ned vedlegg
                                  </a>
                                )}
                                {oppgave.filer && oppgave.filer.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold">Vedlegg:</h4>
                                    <ul className="list-disc list-inside">
                                      {oppgave.filer.map((fil) => (
                                        <li key={fil.id} className="flex items-center">
                                          <a
                                            href={fil.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 underline text-sm"
                                          >
                                            {fil.navn}
                                          </a>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteFile(fil.id, oppgave.id);
                                            }}
                                            className="ml-2 text-red-500"
                                          >
                                            🗑️
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                <KommentarSection
                                  oppgaveId={oppgave.id}
                                  initialComments={oppgave.kommentarer || []}
                                  currentUser={currentUser}
                                />
                              </>
                            )}
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
      <AddOppgaveModal 
        prosjektId={prosjekt.id} 
        onAdd={(nyOppgave: Oppgave) => setOppgaver([...oppgaver, { ...nyOppgave, status: 'Ikke startet' }])}
        currentUser={currentUser}
      />
      {oppgaveTilRedigering && (
        <EditOppgaveModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          oppgave={oppgaveTilRedigering}
          onEdit={(oppdatertOppgave: Oppgave) => {
            // Oppdater oppgavelisten
            setOppgaver((prevOppgaver) =>
              prevOppgaver.map((oppgave) =>
                oppgave.id === oppdatertOppgave.id ? oppdatertOppgave : oppgave
              )
            );
          }}
          currentUser={currentUser}
        />
      )}
      {oppgaveForOpplasting && (
        <UploadFileModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          oppgave={oppgaveForOpplasting}
          onUpload={handleFileUpload}
        />
      )}
    </DragDropContext>
  )
}