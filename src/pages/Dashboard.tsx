import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Sparkles, Home, Upload, LogOut,User, 
  LayoutDashboard, Image as ImageIcon, Coins 
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const Dashboard = () => {
  const { user, logout, refreshUserTokens } = useAuth()
  const tokenCount = typeof user?.tokens === 'number' ? user!.tokens! : 10
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [buyOpen, setBuyOpen] = useState(false)
  const [buyLoading, setBuyLoading] = useState(false)
  const [buyAmount, setBuyAmount] = useState<number>(10)
  const [toast, setToast] = useState<string | null>(null)
  const location = useLocation()

  // Stripe Payment Links from env (configure these in .env)
  const STRIPE_LINK_10 = import.meta.env.VITE_STRIPE_LINK_10 as string | undefined
  const STRIPE_LINK_20 = import.meta.env.VITE_STRIPE_LINK_20 as string | undefined
  const STRIPE_LINK_50 = import.meta.env.VITE_STRIPE_LINK_50 as string | undefined
  const linkForAmount = (amt: number) => (
    amt === 10 ? STRIPE_LINK_10 : amt === 20 ? STRIPE_LINK_20 : amt === 50 ? STRIPE_LINK_50 : undefined
  )

  // Auto-refresh tokens from DB periodically and when tab is focused
  useEffect(() => {
    let timer: number | undefined
    const tick = () => {
      refreshUserTokens && refreshUserTokens()
    }
    tick()
    timer = window.setInterval(tick, 10000)
    const onVis = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      if (timer) window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [refreshUserTokens])

  // Handle return from Stripe Payment Link
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const payment = params.get('payment')
    const amountStr = params.get('amount')
    const amount = amountStr ? parseInt(amountStr, 10) : NaN
    if (payment === 'success' && !Number.isNaN(amount) && user?.email) {
      ;(async () => {
        try {
          const { error } = await supabase
            .from('users')
            .update({ tokens: tokenCount + amount })
            .eq('gmail', user.email)
            .select('tokens')
            .maybeSingle()
          if (error) throw error
          await (refreshUserTokens && refreshUserTokens())
          setToast('Payment successful. Tokens added!')
          window.setTimeout(() => setToast(null), 2500)
        } catch {
          setToast('Could not credit tokens. Please contact support.')
          window.setTimeout(() => setToast(null), 3000)
        }
      })()
    }
  }, [location.search, refreshUserTokens, supabase, tokenCount, user?.email])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: Upload, label: 'Upload Room', path: '/upload', active: false },
    { icon: ImageIcon, label: 'History', path: '/history', active: false },
  ]

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto glass-card m-4 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">FurniFit</h1>
          </div>
          
          <nav className="flex flex-1 flex-col mt-8">
            <ul className="flex flex-1 flex-col gap-y-3">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className={`group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all ${
                      item.active
                        ? 'bg-gradient-primary text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="h-6 w-6 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Tokens */}
          <div className="mt-2">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5">
              <Coins className="w-5 h-5 text-yellow-300" />
              <div className="flex-1">
                <p className="text-xs text-white/60">Tokens</p>
                <p className="text-sm font-semibold">{tokenCount}</p>
              </div>
              <button
                type="button"
                onClick={() => setBuyOpen(true)}
                className="text-xs px-3 py-1 rounded-lg bg-primary/80 hover:bg-primary text-white"
              >
                Buy
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="mt-auto">
            <div className="glass-card p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-white/60 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50">
        <div className="glass-card mx-4 mb-4 rounded-2xl p-4">
          <div className="flex items-center justify-around">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  item.active
                    ? 'text-primary'
                    : 'text-white/70'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-white/70"
            >
              <LogOut className="h-6 w-6" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Welcome back, <span className="text-gradient">{user?.name}</span>
              </h2>
            </div>
            <p className="text-white/70 text-base sm:text-lg">
              Transform your space with AI-powered furniture visualization
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6 hover:scale-105 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold">0</p>
                  <p className="text-sm text-white/60">Rooms Uploaded</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 hover:scale-105 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold">0</p>
                  <p className="text-sm text-white/60">Visualizations</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 hover:scale-105 transition-transform sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold">Pro</p>
                  <p className="text-sm text-white/60">Account Type</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="glass-card p-8 sm:p-12 text-center glow-primary">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to Visualize Your Space?
              </h3>
              <p className="text-white/70 mb-8 text-sm sm:text-base">
                Upload a clean room image and let our AI help you find the perfect furniture fit
              </p>
              <Link
                to="/upload"
                className="btn-gradient inline-block text-base sm:text-lg"
              >
                Upload Room Image
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="glass-card p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Upload Room</h4>
              <p className="text-sm text-white/70">
                Start by uploading a photo of your clean, empty room
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">AI Analysis</h4>
              <p className="text-sm text-white/70">
                Our AI analyzes your space dimensions and lighting
              </p>
            </div>

            <div className="glass-card p-6 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Perfect Match</h4>
              <p className="text-sm text-white/70">
                Visualize furniture that fits your space perfectly
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Buy Tokens Modal */}
      {buyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setBuyOpen(false)} />
          <div className="relative glass-card p-5 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-3">Purchase Tokens</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBuyAmount(amt)}
                    className={`px-3 py-2 rounded-xl border text-sm ${
                      buyAmount === amt ? 'bg-primary text-white border-transparent' : 'border-white/15 hover:bg-white/10'
                    }`}
                  >
                    {amt} Tokens
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={buyLoading}
                onClick={() => {
                  const link = linkForAmount(buyAmount)
                  if (!link) {
                    setToast('Stripe link not configured. Please set it in .env')
                    window.setTimeout(() => setToast(null), 2500)
                    return
                  }
                  setBuyLoading(true)
                  // Redirect to Stripe Payment Link
                  window.location.href = link
                }}
                className="w-full btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buyLoading ? 'Redirecting...' : `Pay with Stripe (${buyAmount} Tokens)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
          {toast}
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative glass-card p-4 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold mb-2">Logout</h3>
            <p className="text-sm text-white/70 mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm text-white/80 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-sm bg-primary text-white hover:opacity-90"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
