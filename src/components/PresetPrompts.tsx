import { PRESET_PROMPTS } from '../types'
import { cn } from '../lib/utils'

interface Props {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export function PresetPrompts({ onSelect, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESET_PROMPTS.map(({ label, prompt }) => (
        <button
          key={label}
          onClick={() => onSelect(prompt)}
          disabled={disabled}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            'bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400',
            'hover:bg-gray-200 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:text-gray-700 dark:hover:text-zinc-200',
            'transition-all',
            disabled && 'opacity-40 cursor-not-allowed',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
