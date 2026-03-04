import { Zap, Clock, Hash } from 'lucide-react'
import { ThinkingBlock } from './ThinkingBlock'
import { cn } from '../lib/utils'
import type { Message } from '../types'

interface Props {
  message: Message
  isStreaming?: boolean
  streamingThinking?: string
}

const HEBREW_RE = /[\u0590-\u05FF]/

function lineDir(line: string): 'rtl' | 'ltr' {
  for (const ch of line) {
    if (/\p{L}/u.test(ch)) return HEBREW_RE.test(ch) ? 'rtl' : 'ltr'
  }
  return 'ltr'
}

function formatInline(text: string, base: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={`${base}-${i}`} className="font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={`${base}-${i}`}>{part.slice(1, -1)}</code>
    return <span key={`${base}-${i}`}>{part}</span>
  })
}

function formatContent(content: string) {
  const segments = content.split(/(```[\s\S]*?```)/g)
  return segments.flatMap((seg, i) => {
    if (seg.startsWith('```')) {
      const lines = seg.split('\n')
      const lang = lines[0].replace('```', '').trim()
      const code = lines.slice(1, -1).join('\n')
      return [(
        <pre key={i}>
          {lang && <span className="text-[10px] text-gray-400 dark:text-zinc-500 block mb-1">{lang}</span>}
          <code>{code}</code>
        </pre>
      )]
    }
    return seg.split('\n').map((line, j) => {
      if (!line.trim()) return <div key={`${i}-${j}`} className="h-1" />
      const dir = lineDir(line)
      return (
        <div key={`${i}-${j}`} dir={dir} className={dir === 'rtl' ? 'text-right' : ''}>
          {formatInline(line, `${i}-${j}`)}
        </div>
      )
    })
  })
}

export function MessageBubble({ message, isStreaming, streamingThinking }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('message-in flex gap-3 w-full', isUser ? 'flex-row-reverse' : 'flex-row')}>

      {/* Avatar */}
      <div className={cn(
        'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mt-1',
        isUser
          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
          : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-600',
      )}>
        {isUser ? 'Y' : 'Q'}
      </div>

      <div className={cn('flex flex-col gap-2 max-w-[82%]', isUser ? 'items-end' : 'items-start')}>

        {/* Thinking block */}
        {!isUser && (message.thinking || (isStreaming && streamingThinking)) && (
          <ThinkingBlock
            content={message.thinking || streamingThinking || ''}
            isStreaming={isStreaming && !message.thinking}
          />
        )}

        {/* Bubble */}
        <div className={cn(
          'px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm'
            : 'bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded-2xl rounded-tl-sm',
        )}>
          {message.content ? (
            <div className="space-y-2">{formatContent(message.content)}</div>
          ) : isStreaming ? (
            <span className="flex gap-1 items-center py-0.5">
              <span className="thinking-dot w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span className="thinking-dot w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span className="thinking-dot w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            </span>
          ) : null}
        </div>

        {/* Stats */}
        {!isUser && message.tps !== undefined && (
          <div className="flex items-center gap-3 px-1 text-[11px] text-gray-400 dark:text-zinc-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">{message.tps}</span>
              <span>t/s</span>
            </span>
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {message.totalTokens?.toLocaleString()} tokens
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {message.duration?.toFixed(1)}s
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
