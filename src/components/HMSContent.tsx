'use client'
import RiskAssessmentForm from "@/components/RiskAssessmentForm"
import AvviksSkjema from "@/components/AvviksSkjema"
import EndringsSkjema from "@/components/EndringsSkjema"
import SjaSkjema from "@/components/sjaSkjema"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import React, { useState, useEffect } from 'react'
import { uploadHMSHandbok, uploadDocument, getHMSDocuments, deleteDocument, deleteHMSHandbok } from "@/actions/hms"
import { Trash2 } from 'lucide-react'


const HMSContent = ({ currentUser }) => {
    const [activeForm, setActiveForm] = useState<string | null>(null)
    const [showPdf, setShowPdf] = useState<boolean>(false)
    const [menuOpen, setMenuOpen] = useState<boolean>(false)
    const [uploadedDocs, setUploadedDocs] = useState<{name: string, url: string}[]>([])
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null)
    const [hmsHandbookUploaded, setHmsHandbookUploaded] = useState<boolean>(!!currentUser.bedrift?.hmsHandbokUrl)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
    useEffect(() => {
        async function fetchDocuments() {
            const documents = await getHMSDocuments()
            const hmsHandbook = documents.find(doc => doc.name === "HMS Håndbok")
            if (hmsHandbook) {
                setHmsHandbookUploaded(true)
                setUploadedDocs([{ name: "HMS Håndbok", url: hmsHandbook.url }, ...documents.filter(doc => doc.name !== "HMS Håndbok")])
            } else {
                setUploadedDocs(documents)
            }
        }
        fetchDocuments()
    }, [])
      
        const defaultLayoutPluginInstance = defaultLayoutPlugin()
      
        const handleNavClick = (formName: string) => {
          setActiveForm(formName)
          setShowPdf(false)
          setMenuOpen(false)
        }
      
        const handlePdfClick = () => {
          setActiveForm(null)
          setShowPdf(true)
          setMenuOpen(false)
        }
      
        const toggleMenu = () => {
          setMenuOpen(!menuOpen)
        }
      
        const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0]
            if (file) {
                const formData = new FormData()
                formData.append("file", file)
                const isHmsHandbook = event.target.id === "hmsHandbookUpload"
                try {
                    if (isHmsHandbook) {
                        const { url } = await uploadHMSHandbok(formData)
                        setHmsHandbookUploaded(true)
                        setUploadedDocs(prev => [{ id: 'hmsHandbok', name: "HMS Håndbok", url }, ...prev.filter(doc => doc.name !== "HMS Håndbok")])
                    } else {
                        const fileName = prompt("Gi dokumentet et navn:", file.name)
                        if (fileName) {
                            formData.append("name", fileName)
                            const { id, url } = await uploadDocument(formData)
                            setUploadedDocs(prev => [...prev, { id, name: fileName, url }])
                        }
                    }
                } catch (error) {
                    console.error("Feil ved opplasting av fil:", error)
                    alert("Det oppstod en feil ved opplasting av filen. Vennligst prøv igjen.")
                }
            }
        }
      
        const handleDocumentClick = (url: string) => {
          setSelectedPdf(url)
          setShowPdf(true)
          setActiveForm(null)
          setMenuOpen(false)
        }

        const handleDeleteDocument = async (documentId: string, documentName: string) => {
          if (confirm(`Er du sikker på at du vil slette dokumentet "${documentName}"?`)) {
            setIsDeleting(documentId)
            try {
              if (documentName === "HMS Håndbok") {
                await deleteHMSHandbok()
                setHmsHandbookUploaded(false)
                setUploadedDocs(prev => prev.filter(doc => doc.name !== "HMS Håndbok"))
              } else {
                await deleteDocument(documentId)
                setUploadedDocs(prev => prev.filter(doc => doc.id !== documentId))
              }
            } catch (error) {
              console.error("Feil ved sletting av dokument:", error)
              alert("Det oppstod en feil ved sletting av dokumentet. Vennligst prøv igjen.")
            } finally {
              setIsDeleting(null)
            }
          }
        }
      
        return (
            <div className="flex flex-col md:flex-row h-screen">
                <Card className="w-full md:w-1/4 h-full">
                    <CardHeader>
                        <CardTitle>HMS Navigasjon</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100vh-200px)]">
                            <div className="space-y-2 p-4">
                                <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavClick('AvviksSkjema')}>
                                    Avviksskjema
                                </Button>
                                <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavClick('SJA skjema')}>
                                    SJA skjema
                                </Button>
                                <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavClick('EndringsSkjema')}>
                                    Endringsskjema
                                </Button>
                                <Separator />
                                <div className="font-semibold pt-2">HMS Dokumentasjon</div>
                                {hmsHandbookUploaded ? (
                                    <div className="flex items-center justify-between">
                                        <Button variant="outline" className="w-full justify-start" onClick={() => handleDocumentClick(uploadedDocs[0].url)}>
                                            HMS Håndbok
                                        </Button>
                                        {currentUser.role === "ADMIN" && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteDocument('hmsHandbok', "HMS Håndbok")}
                                                disabled={isDeleting === 'hmsHandbok'}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    currentUser.role === "ADMIN" && (
                                        <div>
                                            <Button variant="outline" className="w-full justify-start" onClick={() => document.getElementById('hmsHandbookUpload')?.click()}>
                                                Last opp HMS Håndbok
                                            </Button>
                                            <input
                                                id="hmsHandbookUpload"
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </div>
                                    )
                                )}
                                {uploadedDocs.slice(1).map((doc, index) => (
                                      <div key={index} className="flex items-center justify-between">
                                        <Button variant="outline" className="w-full justify-start" onClick={() => handleDocumentClick(doc.url)}>
                                          {doc.name}
                                        </Button>
                                        {currentUser.role === "ADMIN" && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteDocument(doc.id, doc.name)}
                                            disabled={isDeleting === doc.id}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                {currentUser.role === "ADMIN" && (
                                      <div>
                                          <Button variant="outline" className="w-full justify-start" onClick={() => document.getElementById('fileUpload')?.click()}>
                                              Last opp nytt dokument
                                          </Button>
                                          <input
                                              id="fileUpload"
                                              type="file"
                                              accept=".pdf"
                                              onChange={handleFileUpload}
                                              className="hidden"
                                          />
                                      </div>
                                  )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <div className="w-full md:w-3/4 p-4 flex-grow overflow-y-auto">
                    {activeForm === 'AvviksSkjema' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Avviksskjema</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AvviksSkjema />
                            </CardContent>
                        </Card>
                    )}
                    {activeForm === 'EndringsSkjema' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Endringsskjema</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <EndringsSkjema />
                            </CardContent>
                        </Card>
                    )}
                    {activeForm === 'SJA skjema' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>SJA skjema</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <SjaSkjema />
                            </CardContent>
                        </Card>
                    )}
                    {showPdf && selectedPdf && (
                        <div className="flex-grow h-full relative">
                            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                                <div className="h-full w-full absolute top-0 left-0">
                                    <Viewer fileUrl={selectedPdf} plugins={[defaultLayoutPluginInstance]} />
                                </div>
                            </Worker>
                        </div>
                    )}
                </div>
            </div>
        )
    }

export default HMSContent