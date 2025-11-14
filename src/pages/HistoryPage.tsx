import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Sparkles,
  LayoutDashboard,
  Upload,
  Image as ImageIcon,
  LogOut,
  Download,
} from 'lucide-react'

interface HistoryEntry {
  id: number
  userId?: string
  originalUrl: string | null
  outputUrl: string
  roomType?: string
  style?: string | null
  aspectRatio?: string
  createdAt: string
}

const HistoryPage = () => {
  const { user, logout } = useAuth()
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('furnifit_history') || '[]'
      const all: HistoryEntry[] = JSON.parse(raw)
      const filtered = all
        .filter((e) => !user?.id || !e.userId || e.userId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setEntries(filtered)
    } catch {
      setEntries([])
    }
  }, [user?.id])

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Upload, label: 'Upload Room', path: '/upload' },
    { icon: ImageIcon, label: 'History', path: '/history' },
  ]

  const handleDownload = (url: string) => {
    if (!url) return
    const link = document.createElement('a')
    link.href = url
    link.download = 'furnifit-history-output.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

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
                      item.path === '/history'
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

          <div className="mt-auto">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50">
        <div className="glass-card mx-4 mb-4 rounded-2xl p-4">
          <div className="flex items-center justify-around">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  item.path === '/history' ? 'text-primary' : 'text-white/70'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-white/70"
            >
              <LogOut className="h-6 w-6" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <main className="lg:pl-72">
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              History <span className="text-gradient">Preview</span>
            </h2>
            <p className="text-white/70 text-sm sm:text-base">
              Review your recent room visualizations with original and processed images.
            </p>
          </div>

          {entries.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-white/70 mb-4 text-sm sm:text-base">
                No history yet. Upload a room image to see it here.
              </p>
              <Link to="/upload" className="btn-gradient inline-block text-sm sm:text-base">
                Go to Upload Room
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {entries.map((entry) => (
                <div key={entry.id} className="glass-card p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-white/80">
                        {entry.roomType || 'Room'}
                        {entry.style ? ` · ${entry.style}` : ''}
                        {entry.aspectRatio ? ` · ${entry.aspectRatio}` : ''}
                      </p>
                      <p className="text-xs text-white/60">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="glass-card p-2">
                      <p className="text-xs font-semibold text-white/70 mb-2">Original</p>
                      <div className="relative rounded-lg overflow-hidden bg-black/20">
                        {entry.originalUrl && (
                          <img
                            src={entry.originalUrl}
                            alt="Original room"
                            className="w-full h-48 object-contain"
                          />
                        )}
                      </div>
                    </div>

                    <div className="glass-card p-2">
                      <p className="text-xs font-semibold text-white/70 mb-2">Processed</p>
                      <div className="relative rounded-lg overflow-hidden bg-black/20 group">
                        {entry.outputUrl && (
                          <>
                            <img
                              src={entry.outputUrl}
                              alt="Processed room"
                              className="w-full h-48 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleDownload(entry.outputUrl)}
                              className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default HistoryPage
