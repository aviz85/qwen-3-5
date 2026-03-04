import { useState, useEffect, useCallback } from 'react'
import type { Message } from '../types'

export interface Conversation {
  id: string
  title: string
  model: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

const DB_NAME = 'qwen-playground'
const DB_VERSION = 1
const STORE = 'conversations'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx(db: IDBDatabase, mode: IDBTransactionMode) {
  return db.transaction(STORE, mode).objectStore(STORE)
}

async function dbGetAll(db: IDBDatabase): Promise<Conversation[]> {
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readonly').getAll()
    req.onsuccess = () => resolve((req.result as Conversation[]).sort((a, b) => b.updatedAt - a.updatedAt))
    req.onerror = () => reject(req.error)
  })
}

async function dbPut(db: IDBDatabase, conv: Conversation): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').put(conv)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

async function dbDelete(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

async function dbClear(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export function useConversations() {
  const [db, setDb] = useState<IDBDatabase | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    openDB().then(database => {
      setDb(database)
      dbGetAll(database).then(setConversations)
    })
  }, [])

  const refresh = useCallback(async (database: IDBDatabase) => {
    setConversations(await dbGetAll(database))
  }, [])

  const saveConversation = useCallback(async (conv: Conversation) => {
    if (!db) return
    await dbPut(db, conv)
    await refresh(db)
  }, [db, refresh])

  const deleteConversation = useCallback(async (id: string) => {
    if (!db) return
    await dbDelete(db, id)
    await refresh(db)
  }, [db, refresh])

  const clearAll = useCallback(async () => {
    if (!db) return
    await dbClear(db)
    setConversations([])
  }, [db])

  return { conversations, saveConversation, deleteConversation, clearAll }
}
