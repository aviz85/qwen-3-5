import { useState, useCallback, useRef } from 'react'
import type { Message, ChatStats } from '../types'

const OLLAMA_BASE = 'http://127.0.0.1:11434'

export function useOllama() {
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const fetchModels = useCallback(async (): Promise<string[]> => {
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/tags`)
      const data = await res.json()
      return (data.models || [])
        .map((m: { name: string }) => m.name)
        .filter((name: string) => name.startsWith('qwen'))
        .sort((a: string, b: string) => {
          const sizeA = parseFloat(a.split(':')[1] ?? a)
          const sizeB = parseFloat(b.split(':')[1] ?? b)
          return sizeA - sizeB
        })
    } catch {
      return []
    }
  }, [])

  const sendMessage = useCallback(async (
    model: string,
    messages: Message[],
    prompt: string,
    think: boolean,
    onChunk: (text: string) => void,
    onThinkingChunk: (text: string) => void,
    onDone: (stats: ChatStats) => void,
    onError: (err: string) => void,
  ) => {
    setIsStreaming(true)
    abortRef.current = new AbortController()

    // Build conversation history for Ollama chat API
    const history = messages.map(m => ({
      role: m.role,
      content: m.content,
    }))
    history.push({ role: 'user', content: prompt })

    const startTime = Date.now()
    let evalCount = 0
    let evalDuration = 0
    let promptEvalCount = 0
    let accContent = ''
    let accThinking = ''

    try {
      const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model,
          messages: history,
          think,
          stream: true,
          options: {
            temperature: 0.7,
          },
        }),
      })

      if (!res.ok) {
        throw new Error(`Ollama error: ${res.status} ${res.statusText}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value).split('\n').filter(Boolean)
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.message?.thinking) {
              accThinking += data.message.thinking
              onThinkingChunk(data.message.thinking)
            }
            if (data.message?.content) {
              accContent += data.message.content
              onChunk(data.message.content)
            }
            if (data.done) {
              evalCount = data.eval_count || 0
              evalDuration = data.eval_duration || 0
              promptEvalCount = data.prompt_eval_count || 0
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      const wallTime = (Date.now() - startTime) / 1000
      const tps = evalDuration > 0
        ? evalCount / (evalDuration / 1e9)
        : evalCount / wallTime

      onDone({
        tps: Math.round(tps * 10) / 10,
        totalTokens: evalCount + promptEvalCount,
        duration: wallTime,
        content: accContent,
        thinking: accThinking,
      })
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      onError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsStreaming(false)
    }
  }, [])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return { isStreaming, fetchModels, sendMessage, abort }
}
