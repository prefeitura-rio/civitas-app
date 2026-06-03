const DB_NAME = 'civitas_gcs_uploads'
const DB_VERSION = 1
const STORE_NAME = 'gcs_upload_sessions'

export type GcsUploadSession = {
  id: string
  ticketId: string
  rowId: string
  pendingAttachmentId: string
  filename: string
  storageKey: string
  sessionUri: string
  totalBytes: number
  uploadedBytes: number
  contentType: string
  expiresAt: number
  createdAt: number
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

function openGcsUploadDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available on the server'))
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (db.objectStoreNames.contains(STORE_NAME)) return

      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      store.createIndex('ticketId', 'ticketId', { unique: false })
      store.createIndex('pendingAttachmentId', 'pendingAttachmentId', {
        unique: true,
      })
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error('Failed to open IndexedDB'))
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openGcsUploadDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode)
      const store = tx.objectStore(STORE_NAME)
      fn(store).then(resolve).catch(reject)
      tx.onerror = () =>
        reject(tx.error ?? new Error('IndexedDB transaction failed'))
    })
  } finally {
    db.close()
  }
}

export async function createUploadSession(
  data: Omit<GcsUploadSession, 'id' | 'createdAt'>,
): Promise<GcsUploadSession> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is not available on the server')
  }

  const session: GcsUploadSession = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }

  await withStore('readwrite', async (store) => {
    await requestToPromise(store.put(session))
  })

  return session
}

export async function getUploadSession(
  id: string,
): Promise<GcsUploadSession | undefined> {
  if (typeof window === 'undefined') return undefined

  return withStore('readonly', async (store) => {
    const result = await requestToPromise(store.get(id))
    return (result as GcsUploadSession | undefined) ?? undefined
  })
}

export async function getUploadSessionByPendingId(
  pendingAttachmentId: string,
): Promise<GcsUploadSession | undefined> {
  if (typeof window === 'undefined') return undefined

  return withStore('readonly', async (store) => {
    const index = store.index('pendingAttachmentId')
    const result = await requestToPromise(index.get(pendingAttachmentId))
    return (result as GcsUploadSession | undefined) ?? undefined
  })
}

export async function updateUploadSession(
  id: string,
  patch: Partial<GcsUploadSession>,
): Promise<void> {
  if (typeof window === 'undefined') return

  await withStore('readwrite', async (store) => {
    const existing = (await requestToPromise(store.get(id))) as
      | GcsUploadSession
      | undefined
    if (!existing) return

    await requestToPromise(store.put({ ...existing, ...patch, id }))
  })
}

export async function deleteUploadSession(id: string): Promise<void> {
  if (typeof window === 'undefined') return

  await withStore('readwrite', async (store) => {
    await requestToPromise(store.delete(id))
  })
}

export async function listUploadSessions(
  ticketId: string,
): Promise<GcsUploadSession[]> {
  if (typeof window === 'undefined') return []

  return withStore('readonly', async (store) => {
    const index = store.index('ticketId')
    const result = await requestToPromise(index.getAll(ticketId))
    return (result as GcsUploadSession[]) ?? []
  })
}

export function isUploadSessionExpired(session: GcsUploadSession): boolean {
  return Date.now() >= session.expiresAt
}
