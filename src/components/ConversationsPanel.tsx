import { Trash2, MessageSquare, X, AlertTriangle, SquarePen } from 'lucide-react'
import { useState } from 'react'
import type { Conversation } from '../hooks/useConversations'
import { cn } from '../lib/utils'

interface Props {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (conv: Conversation) => void
  onDelete: (id: string) => void
  onClearAll: () => void
  onClose: () => void
  onNew: () => void
}

export function ConversationsPanel({ conversations, activeId, onSelect, onDelete, onClearAll, onClose, onNew }: Props) {
  const [confirmClear, setConfirmClear] = useState(false)

  function formatDate(ts: number) {
    const d = new Date(ts)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' })
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 w-64 shrink-0">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
        <span className="text-xs font-semibold tracking-widest text-gray-400 dark:text-zinc-500 uppercase">
          Conversations
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New conversation */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all"
        >
          <SquarePen className="w-3.5 h-3.5" />
          New conversation
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4 select-none">
            <MessageSquare className="w-8 h-8 text-gray-300 dark:text-zinc-600" />
            <p className="text-xs text-gray-400 dark:text-zinc-500">No saved conversations yet</p>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={cn(
                'group relative flex items-start gap-2 px-3 py-2.5 mx-1 rounded-xl cursor-pointer transition-all',
                conv.id === activeId
                  ? 'bg-emerald-50 dark:bg-emerald-500/10'
                  : 'hover:bg-gray-100 dark:hover:bg-zinc-800',
              )}
              onClick={() => onSelect(conv)}
            >
              <div className="flex-1 min-w-0">
                <p dir="auto" className={cn(
                  'text-xs font-medium truncate',
                  conv.id === activeId
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-gray-700 dark:text-zinc-300',
                )}>
                  {conv.title}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                  {conv.model.split(':')[1] || conv.model} · {formatDate(conv.updatedAt)}
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDelete(conv.id) }}
                className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-gray-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all mt-0.5"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {conversations.length > 0 && (
        <div className="shrink-0 border-t border-gray-200 dark:border-zinc-800 p-3">
          {confirmClear ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Delete all {conversations.length} conversations?
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { onClearAll(); setConfirmClear(false) }}
                  className="flex-1 py-1 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-all"
                >
                  Delete all
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-1 rounded-lg text-xs border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-gray-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-gray-200 dark:border-zinc-700 transition-all"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}
