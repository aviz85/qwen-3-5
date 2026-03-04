import { useState } from 'react'
import { Play, Square, Zap, Clock, Hash } from 'lucide-react'
import { PRESET_PROMPTS, type ComparisonResult } from '../types'
import { cn } from '../lib/utils'

const SIZE_COLOR: Record<string, string> = {
  '0.5b': 'text-orange-400', '0.6b': 'text-orange-400', '0.8b': 'text-orange-400',
  '1.5b': 'text-yellow-400', '1.7b': 'text-yellow-400', '2b': 'text-yellow-400',
  '4b': 'text-green-400',
  '7b': 'text-blue-400', '8b': 'text-blue-400', '9b': 'text-blue-400',
  '14b': 'text-purple-400', '27b': 'text-purple-400', '32b': 'text-purple-400',
}

interface Props {
  models: string[]
  results: ComparisonResult[]
  isComparing: boolean
  isStreaming: boolean
  onRun: (prompt: string) => void
  onAbort: () => void
}

export function CompareView({ models, results, isComparing, isStreaming, onRun, onAbort }: Props) {
  const [prompt, setPrompt] = useState('')

  const doneCount = results.filter(r => r.status === 'done' || r.status === 'error').length

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Prompt input ─────────────────────────────── */}
      <div className="shrink-0 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 pt-3 pb-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PROMPTS.map(({ label, prompt: p }) => (
            <button
              key={label}
              onClick={() => setPrompt(p)}
              disabled={isComparing}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all',
                'bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700',
                'text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700',
                isComparing && 'opacity-40 cursor-not-allowed',
              )}
            >{label}</button>
          ))}
        </div>

        <div className="flex gap-3 items-end">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            dir="auto"
            placeholder="Enter prompt to run on all models sequentially…"
            disabled={isComparing}
            rows={2}
            className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-400/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            onClick={isComparing ? onAbort : () => prompt.trim() && onRun(prompt)}
            disabled={!isComparing && (!prompt.trim() || models.length === 0 || isStreaming)}
            className={cn(
              'shrink-0 h-11 px-4 rounded-2xl flex items-center gap-2 text-sm font-semibold border transition-all',
              'disabled:opacity-30 disabled:cursor-not-allowed',
              isComparing
                ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/40 text-red-500 dark:text-red-400'
                : 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
            )}
          >
            {isComparing
              ? <><Square className="w-4 h-4" /> Stop</>
              : <><Play className="w-4 h-4" /> Run All</>}
          </button>
        </div>

        {isComparing && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${results.length > 0 ? (doneCount / results.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-zinc-500 tabular-nums shrink-0">
              {doneCount} / {results.length}
            </span>
          </div>
        )}
      </div>

      {/* ── Results ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center select-none">
            <div className="text-5xl">⚖️</div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Compare All Models</h2>
              <p className="text-sm text-gray-400 dark:text-zinc-500">
                Runs the same prompt on every model one by one
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {models.map(m => {
                const tag = m.split(':')[1] || m
                return (
                  <span key={m} className={cn('px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800', SIZE_COLOR[tag] ?? 'text-zinc-400')}>
                    {tag.toUpperCase()}
                  </span>
                )
              })}
            </div>
          </div>
        ) : (
          <div className={cn('grid gap-3', results.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
            {results.map((result, idx) => {
              const tag = result.model.split(':')[1] || result.model
              const isLastOdd = idx === results.length - 1 && results.length % 2 !== 0
              return (
                <div
                  key={result.model}
                  className={cn(
                    'rounded-2xl border overflow-hidden flex flex-col',
                    isLastOdd && 'col-span-2',
                    result.status === 'running'
                      ? 'border-emerald-300 dark:border-emerald-500/50'
                      : result.status === 'error'
                      ? 'border-red-200 dark:border-red-500/30'
                      : 'border-gray-200 dark:border-zinc-700',
                  )}
                >
                  {/* Card header */}
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-2 border-b text-[11px]',
                    result.status === 'running'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-gray-50 dark:bg-zinc-800/60 border-gray-200 dark:border-zinc-700',
                  )}>
                    <span className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      result.status === 'pending' && 'bg-gray-300 dark:bg-zinc-600',
                      result.status === 'running' && 'bg-emerald-500 animate-pulse',
                      result.status === 'done'    && 'bg-emerald-500',
                      result.status === 'error'   && 'bg-red-500',
                    )} />
                    <span className={cn('font-bold', SIZE_COLOR[tag] ?? 'text-zinc-400')}>
                      {tag.toUpperCase()}
                    </span>

                    {result.status === 'done' && (
                      <div className="flex items-center gap-3 ml-auto text-gray-400 dark:text-zinc-500">
                        {result.tps !== undefined && (
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">{result.tps}</span>
                            <span>t/s</span>
                          </span>
                        )}
                        {result.totalTokens !== undefined && (
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />{result.totalTokens.toLocaleString()}
                          </span>
                        )}
                        {result.duration !== undefined && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{result.duration.toFixed(1)}s
                          </span>
                        )}
                      </div>
                    )}
                    {result.status === 'pending' && (
                      <span className="ml-auto text-gray-300 dark:text-zinc-600">Waiting…</span>
                    )}
                    {result.status === 'running' && (
                      <span className="ml-auto text-emerald-600 dark:text-emerald-400 animate-pulse">Generating…</span>
                    )}
                  </div>

                  {/* Card content */}
                  <div className="flex-1 p-3 bg-white dark:bg-zinc-900 min-h-[80px] max-h-64 overflow-y-auto scrollbar-thin">
                    {result.status === 'error' ? (
                      <p className="text-xs text-red-500">{result.error}</p>
                    ) : result.content ? (
                      <p dir="auto" className="text-xs text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {result.content}
                      </p>
                    ) : result.status === 'running' ? (
                      <span className="flex gap-1 items-center py-0.5">
                        <span className="thinking-dot w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                        <span className="thinking-dot w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                        <span className="thinking-dot w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300 dark:text-zinc-600">—</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
