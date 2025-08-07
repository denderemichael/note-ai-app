"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, FileText, Lightbulb, Hash, Loader2, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Note } from "@/app/page"
import { generateSummary, generateTags, improveContent, checkApiStatus } from "@/lib/ai-actions"

interface AISidebarProps {
  note: Note
  onClose: () => void
  onUpdateNote: (note: Note) => void
}

export function AISidebar({ note, onClose, onUpdateNote }: AISidebarProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState("")
  const [hasApiKey, setHasApiKey] = useState(true)

  useEffect(() => {
    checkApiStatus().then(setHasApiKey)
  }, [])

  const handleGenerateSummary = async () => {
    if (!note.content.trim()) return

    setLoading("summary")
    try {
      const summary = await generateSummary(note.content)
      const updatedNote: Note = {
        ...note,
        summary,
        updatedAt: new Date(),
      }
      onUpdateNote(updatedNote)
    } catch (error) {
      console.error("Failed to generate summary:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleGenerateTags = async () => {
    if (!note.content.trim()) return

    setLoading("tags")
    try {
      const tags = await generateTags(note.content)
      const uniqueTags = [...new Set([...note.tags, ...tags])]
      const updatedNote: Note = {
        ...note,
        tags: uniqueTags,
        updatedAt: new Date(),
      }
      onUpdateNote(updatedNote)
    } catch (error) {
      console.error("Failed to generate tags:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleImproveContent = async () => {
    if (!note.content.trim()) return

    setLoading("improve")
    try {
      const improvedContent = await improveContent(note.content)
      setSuggestion(improvedContent)
    } catch (error) {
      console.error("Failed to improve content:", error)
    } finally {
      setLoading(null)
    }
  }

  const applySuggestion = () => {
    if (suggestion) {
      const updatedNote: Note = {
        ...note,
        content: suggestion,
        updatedAt: new Date(),
      }
      onUpdateNote(updatedNote)
      setSuggestion("")
    }
  }

  return (
    <div className="w-80 border-l bg-card flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* API Status Alert */}
        {!hasApiKey && (
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription className="text-xs">
              AI features are running in fallback mode. Add your OpenAI API key to the OPENAI_API_KEY environment
              variable for enhanced AI capabilities.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Summary
              {!hasApiKey && (
                <Badge variant="outline" className="text-xs">
                  Basic
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {note.summary ? (
              <p className="text-sm text-muted-foreground">{note.summary}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No summary generated yet</p>
            )}
            <Button
              onClick={handleGenerateSummary}
              disabled={!note.content.trim() || loading === "summary"}
              size="sm"
              className="w-full"
            >
              {loading === "summary" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {hasApiKey ? "Generate Summary" : "Create Basic Summary"}
            </Button>
          </CardContent>
        </Card>

        {/* Tags Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Smart Tags
              {!hasApiKey && (
                <Badge variant="outline" className="text-xs">
                  Basic
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {note.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No tags added yet</p>
            )}
            <Button
              onClick={handleGenerateTags}
              disabled={!note.content.trim() || loading === "tags"}
              size="sm"
              className="w-full"
            >
              {loading === "tags" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {hasApiKey ? "Generate Tags" : "Extract Keywords"}
            </Button>
          </CardContent>
        </Card>

        {/* Content Improvement Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Improve Content
              {!hasApiKey && (
                <Badge variant="outline" className="text-xs">
                  Basic
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleImproveContent}
              disabled={!note.content.trim() || loading === "improve"}
              size="sm"
              className="w-full"
            >
              {loading === "improve" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4 mr-2" />
              )}
              {hasApiKey ? "Get AI Suggestions" : "Format Content"}
            </Button>

            {suggestion && (
              <div className="space-y-2">
                <Textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="text-sm"
                  rows={6}
                />
                <div className="flex gap-2">
                  <Button onClick={applySuggestion} size="sm" className="flex-1">
                    Apply
                  </Button>
                  <Button onClick={() => setSuggestion("")} variant="outline" size="sm" className="flex-1">
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
