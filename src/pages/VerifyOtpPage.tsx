import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, ShieldCheck, RefreshCw } from 'lucide-react'

const WEBHOOK_BASE = import.meta.env.VITE_WEBHOOK_BASE as string
const WEBHOOK_OTP_SENDING = import.meta.env.VITE_WEBHOOK_OTP_SENDING as string

const useQuery = () => new URLSearchParams(useLocation().search)

const VerifyOtpPage = () => {
  const { verifyOtp, requestOtp } = useAuth()
  const query = useQuery()
  const emailParam = useMemo(() => query.get('email') || '', [query])
  const navigate = useNavigate()

  const [email] = useState(emailParam)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' | 'info' } | null>(null)

  const showToast = (msg: string, kind: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, kind })
    window.clearTimeout((showToast as any)._t)
    ;(showToast as any)._t = window.setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (!email) return
    // No auto-send here to avoid duplicates. Registration already triggers a send.
    setInfo(`Enter the 6-digit code we sent to ${email}.`)
  }, [email])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = verifyOtp(email, code.trim())
    setLoading(false)
    if (ok) {
      showToast('OTP verified!', 'success')
      setSuccessOpen(true)
      // Redirect shortly after showing success popup
      window.setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1200)
    } else {
      setError('Invalid or expired code. Please try again or resend.')
      showToast('Invalid or expired code', 'error')
    }
  }

  const onResend = async () => {
    if (!email) return
    const sent = requestOtp(email)
    try {
      const res = await fetch(`${WEBHOOK_BASE}${WEBHOOK_OTP_SENDING}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: sent, resend: true }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      setInfo(`New code sent to ${email}. (dev: ${sent})`)
      setError('')
      showToast('Verification code resent', 'success')
    } catch (err) {
      setError('Failed to resend code. Please try again.')
      showToast('Failed to resend code', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center p-4 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">FurniFit</h1>
        </Link>

        <div className="glass-card p-6 sm:p-8 glow-primary">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <ShieldCheck className="w-6 h-6" /> Verify Your Email
            </h2>
            <p className="text-white/70 text-sm sm:text-base">Enter the 6-digit code we sent to your email</p>
          </div>

          {info && (
            <div className="bg-blue-500/10 border border-blue-500/50 text-blue-200 px-4 py-3 rounded-xl text-sm mb-4">
              {info}
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/90">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="glass-input w-full text-center tracking-widest text-lg"
                placeholder="••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="btn-gradient w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <button
              type="button"
              onClick={onResend}
              className="w-full mt-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-white/80 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" /> Resend Code
            </button>
          </form>
        </div>
      </div>

      {/* Toast popup */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg border ${
            toast.kind === 'success'
              ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
              : toast.kind === 'error'
              ? 'bg-red-500/15 border-red-400/40 text-red-200'
              : 'bg-blue-500/15 border-blue-400/40 text-blue-200'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Success modal */}
      {successOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
          <div className="glass-card p-6 rounded-2xl text-center max-w-sm w-[90%]">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-emerald-500/20 grid place-items-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Code Verified</h3>
            <p className="text-white/70 text-sm">Redirecting to Login...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerifyOtpPage
