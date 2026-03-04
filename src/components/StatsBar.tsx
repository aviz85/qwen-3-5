import { Zap, Hash, Clock, Cpu } from 'lucide-react'
import { cn } from '../lib/utils'

interface Props {
  model: string
  tps?: number
  totalMessages: number
  isStreaming: boolean
}

export function StatsBar({ model, tps, totalMessages, isStreaming }: Props) {
  const tag = model.split(':')[1] || model

  const tpsColor = !tps ? '' : tps >= 40 ? 'text-green-400' : tps >= 20 ? 'text-yellow-400' : tps >= 10 ? 'text-orange-400' : 'text-red-400'

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-100 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-xs text-gray-400 dark:text-zinc-500 shrink-0">
      <div className="flex items-center gap-1.5">
        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold text-gray-700 dark:text-zinc-300">{tag}</span>
        <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-[10px] font-mono text-gray-500 dark:text-zinc-400">
          Metal GPU
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Hash className="w-3 h-3" />
        <span>{totalMessages} msgs</span>
      </div>

      {tps !== undefined && (
        <div className="flex items-center gap-1 font-mono">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span className={cn('font-bold tabular-nums text-sm', tpsColor)}>{tps}</span>
          <span>t/s</span>
        </div>
      )}

      {isStreaming && (
        <div className="flex items-center gap-1.5 ml-auto text-emerald-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="animate-pulse font-medium">Generating…</span>
        </div>
      )}
    </div>
  )
}
