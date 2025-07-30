import { create } from 'zustand'

export type User = {
  id: string
  email: string
  role?: string
  name?: string
  username?: string
  price_range?: number
  sales?: number
  blocked?: boolean
  verify_seller?: boolean
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
    // Type-safe omit password before saving
    const { password, ...safeUser } = user as User & { password?: string }
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
