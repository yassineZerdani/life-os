import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService, type User } from '../services/auth'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, name: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = authService.getToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    try {
      const u = await authService.me()
      setUser(u)
    } catch {
      authService.clearToken()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const signIn = useCallback(async (email: string, password: string) => {
    const { access_token } = await authService.signin(email, password)
    authService.setToken(access_token)
    await loadUser()
  }, [loadUser])

  const signUp = useCallback(async (email: string, name: string, password: string) => {
    const { access_token } = await authService.signup(email, name, password)
    authService.setToken(access_token)
    await loadUser()
  }, [loadUser])

  const signOut = useCallback(() => {
    authService.clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
