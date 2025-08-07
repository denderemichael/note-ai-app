"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Trash2, Tag, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { Note } from "@/app/page"

interface NoteEditorProps {
  note: Note
  onUpdate: (note: Note) => void
  onDelete: (noteId: string) => void
}

export function NoteEditor({ note, onUpdate, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
  }, [note])

  const handleSave = () => {
    const updatedNote: Note = {
      ...note,
      title: title || "Untitled Note",
      content,
      updatedAt: new Date(),
    }
    onUpdate(updatedNote)
  }

  const addTag = () => {
    if (newTag.trim() && !note.tags.includes(newTag.trim())) {
      const updatedNote: Note = {
        ...note,
        tags: [...note.tags, newTag.trim()],
        updatedAt: new Date(),
      }
      onUpdate(updatedNote)
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const updatedNote: Note = {
      ...note,
      tags: note.tags.filter((tag) => tag !== tagToRemove),
      updatedAt: new Date(),
    }
    onUpdate(updatedNote)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave()
    }
  }

  // Auto-save after 1 second of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        handleSave()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [title, content])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        {/* Title */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
          onKeyPress={handleKeyPress}
        />

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeTag(tag)}
              >
                <Hash className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="pl-10"
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
            </div>
            <Button onClick={addTag} variant="outline" size="sm">
              Add
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">{content.length} characters</div>
          <Button variant="destructive" size="sm" onClick={() => onDelete(note.id)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note..."
          className="w-full h-full resize-none border-none focus-visible:ring-0 text-base leading-relaxed"
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  )
}
