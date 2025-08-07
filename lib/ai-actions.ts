"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Check if API key is available
const hasApiKey = !!process.env.OPENAI_API_KEY

export async function generateSummary(content: string): Promise<string> {
  if (!hasApiKey) {
    // Fallback: Create a simple extractive summary
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10)
    const summary = sentences.slice(0, 2).join(". ").trim()
    return summary || "This note contains important information that you've captured."
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a helpful assistant that creates concise summaries of text content. Keep summaries under 100 words and focus on the main points.",
      prompt: `Please summarize the following note content:\n\n${content}`,
    })
    return text
  } catch (error) {
    console.error("AI Summary failed:", error)
    // Fallback summary
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10)
    const summary = sentences.slice(0, 2).join(". ").trim()
    return summary || "This note contains important information."
  }
}

export async function generateTags(content: string): Promise<string[]> {
  if (!hasApiKey) {
    // Fallback: Extract potential tags from content
    const words = content.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
    const commonWords = new Set([
      "the",
      "and",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "had",
      "her",
      "was",
      "one",
      "our",
      "out",
      "day",
      "get",
      "has",
      "him",
      "his",
      "how",
      "man",
      "new",
      "now",
      "old",
      "see",
      "two",
      "way",
      "who",
      "boy",
      "did",
      "its",
      "let",
      "put",
      "say",
      "she",
      "too",
      "use",
    ])
    const uniqueWords = [...new Set(words)].filter((word) => !commonWords.has(word))
    return uniqueWords.slice(0, 5)
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a helpful assistant that generates relevant tags for text content. Return only a comma-separated list of 3-5 relevant tags, no explanations.",
      prompt: `Generate relevant tags for the following note content:\n\n${content}`,
    })

    return text
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
  } catch (error) {
    console.error("AI Tags failed:", error)
    // Fallback tag generation
    const words = content.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
    const commonWords = new Set([
      "the",
      "and",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "had",
      "her",
      "was",
      "one",
      "our",
      "out",
      "day",
      "get",
      "has",
      "him",
      "his",
      "how",
      "man",
      "new",
      "now",
      "old",
      "see",
      "two",
      "way",
      "who",
      "boy",
      "did",
      "its",
      "let",
      "put",
      "say",
      "she",
      "too",
      "use",
    ])
    const uniqueWords = [...new Set(words)].filter((word) => !commonWords.has(word))
    return uniqueWords.slice(0, 5)
  }
}

export async function improveContent(content: string): Promise<string> {
  if (!hasApiKey) {
    // Fallback: Basic content formatting improvements
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Capitalize first letter of each sentence
        return line.replace(/(^|\. )([a-z])/g, (match, prefix, letter) => prefix + letter.toUpperCase())
      })
      .join("\n\n")
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a helpful writing assistant. Improve the given text by making it clearer, more organized, and better structured while maintaining the original meaning and tone.",
      prompt: `Please improve the following note content:\n\n${content}`,
    })
    return text
  } catch (error) {
    console.error("AI Improvement failed:", error)
    // Fallback: Basic formatting
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        return line.replace(/(^|\. )([a-z])/g, (match, prefix, letter) => prefix + letter.toUpperCase())
      })
      .join("\n\n")
  }
}

export async function checkApiStatus(): Promise<boolean> {
  return hasApiKey
}
