const ID_KEY = 'civitas_impersonate_user_id'
const LABEL_KEY = 'civitas_impersonate_user_label'

export function getChamadosImpersonateUserId(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(ID_KEY)
}

export function getChamadosImpersonateUserLabel(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(LABEL_KEY)
}

export function setChamadosImpersonationStorage(userId: string, label: string) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(ID_KEY, userId)
  sessionStorage.setItem(LABEL_KEY, label)
}

export function clearChamadosImpersonationStorage() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(ID_KEY)
  sessionStorage.removeItem(LABEL_KEY)
}
