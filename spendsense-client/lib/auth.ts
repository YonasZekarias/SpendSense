export type UserProfile = {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: "user" | "vendor" | "admin"
  city: string | null
  household_size: number | null
  monthly_income: string | null
  onboarding_completed: boolean
  created_at: string
}

type AuthTokens = {
  access: string
  refresh: string
}

const ACCESS_KEY = "spendsense_access_token"
const REFRESH_KEY = "spendsense_refresh_token"
const USER_KEY = "spendsense_user"
const STORAGE_KEY = "spendsense_storage_type"

function localAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function sessionAvailable() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined"
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"
}

function getCurrentStorage(): Storage | null {
  if (!localAvailable() || !sessionAvailable()) {
    return null
  }

  const preferred = window.localStorage.getItem(STORAGE_KEY)
  if (preferred === "local") {
    return window.localStorage
  }
  if (preferred === "session") {
    return window.sessionStorage
  }

  const localHas = window.localStorage.getItem(ACCESS_KEY)
  if (localHas) {
    return window.localStorage
  }
  const sessionHas = window.sessionStorage.getItem(ACCESS_KEY)
  if (sessionHas) {
    return window.sessionStorage
  }
  return null
}

export function storeAuth(tokens: AuthTokens, user: UserProfile, rememberMe: boolean) {
  if (!localAvailable() || !sessionAvailable()) {
    return
  }

  const target = rememberMe ? window.localStorage : window.sessionStorage
  const other = rememberMe ? window.sessionStorage : window.localStorage

  other.removeItem(ACCESS_KEY)
  other.removeItem(REFRESH_KEY)
  other.removeItem(USER_KEY)

  target.setItem(ACCESS_KEY, tokens.access)
  target.setItem(REFRESH_KEY, tokens.refresh)
  target.setItem(USER_KEY, JSON.stringify(user))
  window.localStorage.setItem(STORAGE_KEY, rememberMe ? "local" : "session")
}

export function clearAuth() {
  if (!localAvailable() || !sessionAvailable()) {
    return
  }
  window.localStorage.removeItem(ACCESS_KEY)
  window.localStorage.removeItem(REFRESH_KEY)
  window.localStorage.removeItem(USER_KEY)
  window.localStorage.removeItem(STORAGE_KEY)
  window.sessionStorage.removeItem(ACCESS_KEY)
  window.sessionStorage.removeItem(REFRESH_KEY)
  window.sessionStorage.removeItem(USER_KEY)
}

export function getStoredUser(): UserProfile | null {
  const storage = getCurrentStorage()
  if (!storage) {
    return null
  }

  const raw = storage.getItem(USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

function getTokens() {
  const storage = getCurrentStorage()
  if (!storage) {
    return null
  }
  const access = storage.getItem(ACCESS_KEY)
  const refresh = storage.getItem(REFRESH_KEY)
  if (!access || !refresh) {
    return null
  }
  return { access, refresh, storage }
}

async function refreshAccessToken() {
  const tokenData = getTokens()
  if (!tokenData) {
    return null
  }

  const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: tokenData.refresh }),
  })

  if (!response.ok) {
    clearAuth()
    return null
  }

  const data = await response.json()
  const newAccess = data?.access as string | undefined
  if (!newAccess) {
    clearAuth()
    return null
  }

  tokenData.storage.setItem(ACCESS_KEY, newAccess)
  return newAccess
}

export async function apiRequest(path: string, init?: RequestInit, requiresAuth = false): Promise<Response> {
  const baseHeaders = new Headers(init?.headers)
  if (!baseHeaders.has("Content-Type") && init?.body) {
    baseHeaders.set("Content-Type", "application/json")
  }

  let accessToken: string | null = null
  if (requiresAuth) {
    const tokenData = getTokens()
    accessToken = tokenData?.access ?? null
    if (accessToken) {
      baseHeaders.set("Authorization", `Bearer ${accessToken}`)
    }
  }

  let response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: baseHeaders,
  })

  if (response.status === 401 && requiresAuth) {
    const nextAccess = await refreshAccessToken()
    if (nextAccess) {
      baseHeaders.set("Authorization", `Bearer ${nextAccess}`)
      response = await fetch(`${getApiBaseUrl()}${path}`, {
        ...init,
        headers: baseHeaders,
      })
    }
  }

  return response
}

export async function fetchCurrentUser() {
  const response = await apiRequest("/api/auth/me/", { method: "GET" }, true)
  if (!response.ok) {
    if (response.status === 401) {
      clearAuth()
    }
    return null
  }
  const data = await response.json()
  const user = data?.user as UserProfile | undefined
  if (!user) {
    return null
  }

  const tokenData = getTokens()
  if (tokenData) {
    tokenData.storage.setItem(USER_KEY, JSON.stringify(user))
  }
  return user
}
