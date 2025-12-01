import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

const WEBHOOK_BASE = import.meta.env.VITE_WEBHOOK_BASE as string
const WEBHOOK_REGISTRATION = import.meta.env.VITE_WEBHOOK_REGISTRATION as string
const WEBHOOK_OTP_SENDING = import.meta.env.VITE_WEBHOOK_OTP_SENDING as string

interface User {
  id: string
  name: string
  email: string
  tokens?: number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
  requestOtp: (email: string) => string
  verifyOtp: (email: string, code: string) => boolean
  refreshUserTokens?: () => Promise<void>
  setUserTokens?: (n: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('furnifit_user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        // hydrate latest tokens from DB
        if (parsed?.email) {
          ;(async () => {
            try {
              const { data: row } = await supabase
                .from('users')
                .select('tokens')
                .eq('gmail', parsed.email)
                .maybeSingle()
              if (row && typeof row.tokens === 'number') {
                const next = { ...parsed, tokens: row.tokens as number }
                setUser(next)
                localStorage.setItem('furnifit_user', JSON.stringify(next))
              }
            } catch {}
          })()
        }
      } catch {
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  const requestOtp = (email: string): string => {
    // generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
    const key = `furnifit_otp_${email}`
    localStorage.setItem(key, JSON.stringify({ code, expiresAt }))
    // In production, send this via email/SMS
    console.log('OTP for', email, code)
    return code
  }

  const verifyOtp = (email: string, code: string): boolean => {
    const key = `furnifit_otp_${email}`
    const raw = localStorage.getItem(key)
    if (!raw) return false
    try {
      const { code: saved, expiresAt } = JSON.parse(raw)
      const ok = saved === code && Date.now() <= Number(expiresAt)
      if (ok) localStorage.removeItem(key)
      return !!ok
    } catch {
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const payload = {
        id: Date.now().toString(),
        name,
        email,
        password,
        createdAt: new Date().toISOString(),
      }

      const res = await fetch(`${WEBHOOK_BASE}${WEBHOOK_REGISTRATION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) return false

      try {
        await supabase.from('users').upsert(
          { username: name, gmail: email, password, tokens: 10 },
          { onConflict: 'gmail' }
        )
      } catch (e) {
        console.error('Supabase user upsert failed:', e)
      }

      // Generate and send OTP via external webhook
      const otp = requestOtp(email)
      try {
        await fetch(`${WEBHOOK_BASE}${WEBHOOK_OTP_SENDING}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: otp, resend: false }),
        })
      } catch (e) {
        console.error('OTP webhook error:', e)
        // still allow flow to continue to /verify
      }

      return true
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user')
        .select('id, username, gmail, password')
        .eq('gmail', email)
        .eq('password', password)
        .maybeSingle()

      if (error) {
        console.error('Supabase login error:', error)
        return false
      }

      if (!data) {
        return false
      }

      let tokens: number | undefined
      try {
        const { data: fullRow } = await supabase
          .from('users')
          .select('id, tokens')
          .eq('gmail', email)
          .maybeSingle()
        tokens = fullRow?.tokens ?? undefined
      } catch {}

      const userSession = {
        id: String(data.id),
        name: data.username as string,
        email: data.gmail as string,
        tokens,
      }

      setUser(userSession)
      localStorage.setItem('furnifit_user', JSON.stringify(userSession))
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const refreshUserTokens = async () => {
    if (!user?.email) return
    try {
      const { data } = await supabase
        .from('users')
        .select('tokens')
        .eq('gmail', user.email)
        .maybeSingle()
      if (data && typeof data.tokens === 'number') {
        const next = { ...user, tokens: data.tokens as number }
        setUser(next)
        localStorage.setItem('furnifit_user', JSON.stringify(next))
      }
    } catch {}
  }

  const setUserTokens = (n: number) => {
    if (!user) return
    const next = { ...user, tokens: n }
    setUser(next)
    try {
      localStorage.setItem('furnifit_user', JSON.stringify(next))
    } catch {}
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('furnifit_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
        requestOtp,
        verifyOtp,
        refreshUserTokens,
        setUserTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
