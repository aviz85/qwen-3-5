import { cn } from '../lib/utils'

const MODEL_META: Record<string, { color: string; dot: string; speed: string }> = {
  '0.8b': { color: 'text-orange-400',  dot: 'bg-orange-400',  speed: '~80 t/s' },
  '2b':   { color: 'text-yellow-400',  dot: 'bg-yellow-400',  speed: '~50 t/s' },
  '4b':   { color: 'text-green-400',   dot: 'bg-green-400',   speed: '~30 t/s' },
  '9b':   { color: 'text-blue-400',    dot: 'bg-blue-400',    speed: '~15 t/s' },
  '27b':  { color: 'text-purple-400',  dot: 'bg-purple-400',  speed: '~5 t/s'  },
}

interface Props {
  models: string[]
  selected: string
  onSelect: (model: string) => void
  disabled?: boolean
}

export function ModelSelector({ models, selected, onSelect, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {models.map(model => {
        const tag      = model.split(':')[1] || model
        const meta     = MODEL_META[tag] ?? { color: 'text-zinc-400', dot: 'bg-zinc-400', speed: '?' }
        const active   = selected === model

        return (
          <button
            key={model}
            onClick={() => onSelect(model)}
            disabled={disabled}
            className={cn(
              'relative flex flex-col items-start gap-0.5 px-3 py-2 rounded-xl text-xs',
              'border transition-all min-w-[90px]',
              active
                ? 'bg-gray-200 dark:bg-zinc-700 border-gray-400 dark:border-zinc-500 shadow-md'
                : 'bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600',
              disabled && 'opacity-40 cursor-not-allowed',
            )}
          >
            <span className={cn('font-bold tracking-tight', meta.color)}>
              {tag.replace('b', 'B').toUpperCase()}
            </span>
            <span className="text-gray-400 dark:text-zinc-500 font-mono">{meta.speed}</span>
            {active && <span className={cn('absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full', meta.dot)} />}
          </button>
        )
      })}
    </div>
  )
}
