import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Square, Trash2, Brain, Sun, Moon, GitCompare, MessageSquare, PanelLeft } from 'lucide-react'
import { ModelSelector } from './components/ModelSelector'
import { MessageBubble } from './components/MessageBubble'
import { PresetPrompts } from './components/PresetPrompts'
import { StatsBar } from './components/StatsBar'
import { CompareView } from './components/CompareView'
import { ConversationsPanel } from './components/ConversationsPanel'
import { useOllama } from './hooks/useOllama'
import { useDarkMode } from './hooks/useDarkMode'
import { useConversations } from './hooks/useConversations'
import { cn } from './lib/utils'
import type { Message, ComparisonResult } from './types'

function generateId() { return Math.random().toString(36).slice(2) }

function titleFromMessages(messages: Message[]): string {
  const first = messages.find(m => m.role === 'user')
  if (!first) return 'New conversation'
  return first.content.slice(0, 50) + (first.content.length > 50 ? '…' : '')
}

export default function App() {
  const [models, setModels]                   = useState<string[]>([])
  const [selectedModel, setSelectedModel]     = useState('')
  const [messages, setMessages]               = useState<Message[]>([])
  const [input, setInput]                     = useState('')
  const [thinkMode, setThinkMode]             = useState(true)
  const [lastTps, setLastTps]                 = useState<number | undefined>()
  const [streamingContent, setStreamingContent]   = useState('')
  const [streamingThinking, setStreamingThinking] = useState('')
  const [error, setError]                     = useState<string | null>(null)
  const [mode, setMode]                       = useState<'chat' | 'compare'>('chat')
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([])
  const [isComparing, setIsComparing]         = useState(false)
  const [sidebarOpen, setSidebarOpen]         = useState(false)
  const [activeConvId, setActiveConvId]       = useState<string | null>(null)

  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const textareaRef     = useRef<HTMLTextAreaElement>(null)
  const compareAbortRef = useRef(false)
  const { isStreaming, fetchModels, sendMessage, abort } = useOllama()
  const { dark, toggle: toggleDark } = useDarkMode()
  const { conversations, saveConversation, deleteConversation, clearAll } = useConversations()

  useEffect(() => {
    fetchModels().then(mods => {
      setModels(mods)
      if (mods.length > 0) setSelectedModel(mods.find(m => m.includes('9b')) || mods[mods.length - 1])
    })
  }, [fetchModels])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) },
    [messages, streamingContent, streamingThinking])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [input])

  const handleSend = useCallback(async (promptOverride?: string) => {
    const prompt = (promptOverride ?? input).trim()
    if (!prompt || isStreaming || !selectedModel) return

    setInput(''); setError(null)
    setStreamingContent(''); setStreamingThinking('')

    const userMsg: Message = { id: generateId(), role: 'user', content: prompt, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])

    await sendMessage(
      selectedModel, messages, prompt, thinkMode,
      chunk => setStreamingContent(prev => prev + chunk),
      chunk => setStreamingThinking(prev => prev + chunk),
      stats => {
        setLastTps(stats.tps)
        const assistantMsg: Message = {
          id: generateId(), role: 'assistant',
          content: stats.content,
          thinking: stats.thinking || undefined,
          tps: stats.tps, totalTokens: stats.totalTokens, duration: stats.duration,
          timestamp: Date.now(),
        }
        setMessages(prev => {
          const updated = [...prev, assistantMsg]
          // Auto-save conversation after each assistant reply
          const convId = activeConvId ?? generateId()
          if (!activeConvId) setActiveConvId(convId)
          saveConversation({
            id: convId,
            title: titleFromMessages([...prev, assistantMsg]),
            model: selectedModel,
            messages: updated,
            createdAt: updated[0]?.timestamp ?? Date.now(),
            updatedAt: Date.now(),
          })
          return updated
        })
        setStreamingContent(''); setStreamingThinking('')
      },
      err => { setError(err); setStreamingContent(''); setStreamingThinking('') },
    )
  }, [input, isStreaming, selectedModel, messages, thinkMode, sendMessage, activeConvId, saveConversation])

  const runComparison = useCallback(async (prompt: string) => {
    if (isStreaming || !prompt.trim() || models.length === 0) return

    compareAbortRef.current = false
    setIsComparing(true)
    setComparisonResults(models.map(m => ({ model: m, content: '', status: 'pending' as const })))

    for (const model of models) {
      if (compareAbortRef.current) break

      setComparisonResults(prev => prev.map(r =>
        r.model === model ? { ...r, status: 'running' as const } : r
      ))

      await sendMessage(
        model, [], prompt, thinkMode,
        chunk => setComparisonResults(prev => prev.map(r =>
          r.model === model ? { ...r, content: r.content + chunk } : r
        )),
        _chunk => {},
        stats => setComparisonResults(prev => prev.map(r =>
          r.model === model
            ? { ...r, status: 'done' as const, content: stats.content, tps: stats.tps, totalTokens: stats.totalTokens, duration: stats.duration }
            : r
        )),
        err => setComparisonResults(prev => prev.map(r =>
          r.model === model ? { ...r, status: 'error' as const, error: err } : r
        )),
      )
    }

    setIsComparing(false)
  }, [models, isStreaming, thinkMode, sendMessage])

  const abortComparison = useCallback(() => {
    compareAbortRef.current = true
    abort()
    setIsComparing(false)
  }, [abort])

  const newChat = useCallback(() => {
    setMessages([])
    setLastTps(undefined)
    setError(null)
    setActiveConvId(null)
  }, [])

  const loadConversation = useCallback((conv: { id: string; model: string; messages: Message[] }) => {
    setMessages(conv.messages)
    setSelectedModel(conv.model)
    setActiveConvId(conv.id)
    setError(null)
    setMode('chat')
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center border transition-all',
              sidebarOpen
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100',
            )}
            title="Conversations"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
            <span className="text-emerald-600 dark:text-emerald-400 font-black text-base">Q</span>
          </div>
          <div>
            <h1 className="text-sm font-bold">Qwen3.5 Playground</h1>
            <p className="text-[11px] text-gray-400 dark:text-zinc-500">Local · Apple M5 · Metal GPU</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 text-xs font-semibold">
            <button
              onClick={() => setMode('chat')}
              disabled={isStreaming || isComparing}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 transition-all',
                mode === 'chat'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-700',
                (isStreaming || isComparing) && 'opacity-50 cursor-not-allowed',
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              onClick={() => setMode('compare')}
              disabled={isStreaming || isComparing}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 border-l border-gray-200 dark:border-zinc-700 transition-all',
                mode === 'compare'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-700',
                (isStreaming || isComparing) && 'opacity-50 cursor-not-allowed',
              )}
            >
              <GitCompare className="w-3.5 h-3.5" />
              Compare
            </button>
          </div>

          <button
            onClick={toggleDark}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-all"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setThinkMode(!thinkMode)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
              thinkMode
                ? 'border-amber-500/50 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400',
            )}
          >
            <Brain className="w-3.5 h-3.5" />
            {thinkMode ? 'Thinking ON' : 'Thinking OFF'}
          </button>

          {mode === 'chat' && (
            <button
              onClick={newChat}
              disabled={isStreaming || messages.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              New
            </button>
          )}
        </div>
      </header>

      {/* ── Body (sidebar + main) ───────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Conversations sidebar */}
        {sidebarOpen && (
          <ConversationsPanel
            conversations={conversations}
            activeId={activeConvId}
            onSelect={loadConversation}
            onDelete={deleteConversation}
            onClearAll={clearAll}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* ── Model selector ───────────────────────────────── */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shrink-0">
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase mb-2.5">
              {mode === 'chat' ? 'Model' : 'Models (all will run sequentially)'}
            </p>
            {models.length === 0
              ? <p className="text-sm text-gray-400 dark:text-zinc-500 animate-pulse">Connecting to Ollama…</p>
              : <ModelSelector models={models} selected={selectedModel} onSelect={setSelectedModel} disabled={isStreaming || isComparing} />
            }
          </div>

          {/* ── Chat mode ──────────────────────────────────────*/}
          {mode === 'chat' && (
            <>
              {selectedModel && (
                <StatsBar model={selectedModel} tps={lastTps} totalMessages={messages.length} isStreaming={isStreaming} />
              )}

              <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-6 space-y-6 bg-white dark:bg-zinc-950">
                {messages.length === 0 && !isStreaming && (
                  <div className="flex flex-col items-center justify-center h-full gap-5 text-center select-none">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-center justify-center">
                      <span className="text-5xl font-black text-emerald-500 dark:text-emerald-400">Q</span>
                    </div>
                    <div className="space-y-1.5">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Qwen3.5 is ready</h2>
                      <p className="text-sm text-gray-400 dark:text-zinc-500">Running locally · No internet · 100% private</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 border border-gray-200 dark:border-zinc-800 rounded-full px-4 py-1.5 bg-gray-50 dark:bg-zinc-900">
                      Pick a preset or type a message ↓
                    </span>
                  </div>
                )}

                {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}

                {isStreaming && (
                  <MessageBubble
                    message={{ id: 'streaming', role: 'assistant', content: streamingContent, timestamp: Date.now() }}
                    isStreaming
                    streamingThinking={streamingThinking}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && (
                <div className="mx-5 mb-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-500/30 text-sm text-red-600 dark:text-red-400">
                  ⚠️ {error}
                </div>
              )}

              <div className="shrink-0 bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 px-4 pt-3 pb-4 space-y-3">
                <PresetPrompts onSelect={p => handleSend(p)} disabled={isStreaming} />
                <div className="flex gap-3 items-end">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedModel ? `Message ${selectedModel}… (Enter ↵ to send)` : 'Select a model first…'}
                    disabled={isStreaming || !selectedModel}
                    dir="auto"
                    rows={1}
                    className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-400/10 dark:focus:ring-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    onClick={isStreaming ? abort : () => handleSend()}
                    disabled={!selectedModel || (!isStreaming && !input.trim())}
                    className={cn(
                      'shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center border transition-all',
                      'disabled:opacity-30 disabled:cursor-not-allowed',
                      isStreaming
                        ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/40 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20'
                        : 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/25',
                    )}
                  >
                    {isStreaming ? <Square className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-zinc-600 text-center">
                  Enter to send · Shift+Enter for newline · ■ to stop
                </p>
              </div>
            </>
          )}

          {/* ── Compare mode ─────────────────────────────────── */}
          {mode === 'compare' && (
            <div className="flex-1 overflow-hidden">
              <CompareView
                models={models}
                results={comparisonResults}
                isComparing={isComparing}
                isStreaming={isStreaming}
                onRun={runComparison}
                onAbort={abortComparison}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
