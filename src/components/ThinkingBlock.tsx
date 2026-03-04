import { useState } from 'react'
import { ChevronDown, ChevronRight, Brain } from 'lucide-react'
import { cn } from '../lib/utils'

interface Props {
  content: string
  isStreaming?: boolean
}

export function ThinkingBlock({ content, isStreaming }: Props) {
  const [expanded, setExpanded] = useState(false)
  if (!content) return null

  const wordCount = content.trim().split(/\s+/).length

  return (
    <div className="w-full rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/5 transition-colors"
      >
        <Brain className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold">
          {isStreaming ? 'Thinking…' : 'Thought process'}
        </span>
        {isStreaming && (
          <span className="flex gap-0.5 ml-0.5">
            <span className="thinking-dot w-1 h-1 rounded-full bg-amber-400" />
            <span className="thinking-dot w-1 h-1 rounded-full bg-amber-400" />
            <span className="thinking-dot w-1 h-1 rounded-full bg-amber-400" />
          </span>
        )}
        <span className="ml-auto text-amber-500/70 dark:text-amber-500/70 tabular-nums">{wordCount} words</span>
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-amber-500 dark:text-amber-500" />
          : <ChevronRight className="w-3.5 h-3.5 text-amber-500 dark:text-amber-500" />}
      </button>
      {expanded && (
        <div className={cn(
          'px-3 pb-3 text-xs text-amber-700/70 dark:text-amber-200/60 font-mono whitespace-pre-wrap leading-relaxed',
          'max-h-48 overflow-y-auto scrollbar-thin border-t border-amber-200 dark:border-amber-500/20 pt-2',
        )}>
          {content}
        </div>
      )}
    </div>
  )
}
