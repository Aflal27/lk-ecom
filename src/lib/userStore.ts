import { create } from 'zustand'

export type User = {
  id: string
  email: string
  role?: string
  name?: string
  [key: string]: any
}

interface UserState {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}

function getInitialUser(): User | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user')
    if (stored) return JSON.parse(stored)
  }
  return null
}

export const useUserStore = create<UserState>((set) => ({
  user: getInitialUser(),
  setUser: (user) => {
    // Remove password before saving to state/localStorage
    const { password, ...safeUser } = user
    set({ user: safeUser })
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(safeUser))
    }
  },
  clearUser: () => {
    set({ user: null })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  },
}))
