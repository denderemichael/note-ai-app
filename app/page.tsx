"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Menu, X, Sparkles, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NoteEditor } from "@/components/note-editor"
import { AISidebar } from "@/components/ai-sidebar"

export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  summary?: string
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false)

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("ai-notes")
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }))
      setNotes(parsedNotes)
      if (parsedNotes.length > 0) {
        setSelectedNote(parsedNotes[0])
      }
    }
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem("ai-notes", JSON.stringify(notes))
    }
  }, [notes])

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    }
    setNotes((prev) => [newNote, ...prev])
    setSelectedNote(newNote)
    setSidebarOpen(false)
  }

  const updateNote = (updatedNote: Note) => {
    setNotes((prev) => prev.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
    setSelectedNote(updatedNote)
  }

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId))
    if (selectedNote?.id === noteId) {
      const remainingNotes = notes.filter((note) => note.id !== noteId)
      setSelectedNote(remainingNotes.length > 0 ? remainingNotes[0] : null)
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        w-80 h-full bg-card border-r z-50 flex flex-col
      `}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              AI Notes
            </h1>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <Button onClick={createNewNote} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
            <Button variant="outline" size="icon" onClick={() => setAiSidebarOpen(!aiSidebarOpen)} className="shrink-0">
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchQuery ? "No notes found" : "No notes yet. Create your first note!"}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <Card
                key={note.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedNote?.id === note.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  setSelectedNote(note)
                  setSidebarOpen(false)
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium truncate">{note.title}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {note.updatedAt.toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{note.content || "No content"}</p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{note.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            {selectedNote && (
              <>
                <span className="text-sm text-muted-foreground">
                  Last updated: {selectedNote.updatedAt.toLocaleString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
                  className="hidden sm:flex"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1">
            {selectedNote ? (
              <NoteEditor note={selectedNote} onUpdate={updateNote} onDelete={deleteNote} />
            ) : (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Welcome to AI Notes</h2>
                  <p className="text-muted-foreground mb-4">
                    Create your first note to get started with AI-powered note-taking
                  </p>
                  <Button onClick={createNewNote}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Note
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* AI Sidebar */}
          {aiSidebarOpen && selectedNote && (
            <AISidebar note={selectedNote} onClose={() => setAiSidebarOpen(false)} onUpdateNote={updateNote} />
          )}
        </div>
      </div>
    </div>
  )
}
