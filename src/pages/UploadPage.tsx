import { useState, useRef, DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Sparkles, Upload, X, Check, AlertCircle,
  LayoutDashboard, LogOut, Home as HomeIcon, Mountain, Star, Waves,
  Briefcase, Utensils, Image as ImageIcon, Download
} from 'lucide-react'

const UploadPage = () => {
  const { user, logout } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<string>('living')
  const [selectedRatio, setSelectedRatio] = useState<string>('original')
  const [aspectModalOpen, setAspectModalOpen] = useState<boolean>(false)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Build an AI prompt from current selections (not shown in UI)
  // Try to extract the first http(s) URL from any JSON shape or string
  const extractUrl = (payload: any): string | null => {
    if (!payload) return null
    const tryStr = (s: string) => {
      const m = s.match(/https?:\/\/\S+/)
      return m ? m[0] : null
    }
    if (typeof payload === 'string') return tryStr(payload)
    if (typeof payload === 'object') {
      // common keys
      for (const k of ['imageUrl', 'url', 'outputUrl', 'result', 'data', 'image']) {
        if ((payload as any)[k]) {
          const v: any = (payload as any)[k]
          if (typeof v === 'string') return tryStr(v) || v
          const rec = extractUrl(v)
          if (rec) return rec
        }
      }
      // search recursively
      for (const v of Object.values(payload)) {
        const rec = extractUrl(v)
        if (rec) return rec
      }
    }
    return null
  }

  const saveHistoryEntry = (finalUrl: string) => {
    if (!finalUrl) return
    try {
      const raw = localStorage.getItem('furnifit_history') || '[]'
      const history = JSON.parse(raw)
      const entry = {
        id: Date.now(),
        userId: user?.id,
        originalUrl: previewUrl,
        outputUrl: finalUrl,
        roomType: selectedRoom,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        createdAt: new Date().toISOString(),
      }
      history.push(entry)
      localStorage.setItem('furnifit_history', JSON.stringify(history))
    } catch {
    }
  }

  // Build an AI prompt from current selections (not shown in UI)
  const getAIPrompt = (room: string, style?: string | null): string => {
    const styleAliases: Record<string, string> = {
      countryside: 'country',
      minimalist: 'minimal',
    }

    const normalizedStyle = style ? (styleAliases[style] || style) : undefined

    const roomLabelMap: Record<string, string> = {
      room: 'room',
      living: 'living room',
      office: 'home office',
      dining: 'dining room',
      kitchen: 'kitchen',
    }

    const styleHints: Record<string, string> = {
      modern: 'clean lines, minimalist forms, neutral palette, matte finishes, subtle lighting',
      cozy: 'warm tones, soft textures, layered textiles, ambient lighting, inviting atmosphere',
      scandinavian: 'light woods, airy feel, functional simplicity, white walls, natural light',
      minimal: 'reduced visual noise, essential shapes, ample negative space, neutral colors',
      coastal: 'light palette, breezy textures, natural fibers, ocean-inspired accents',
      loft: 'open plan, industrial touches, exposed materials, large windows',
      retro: 'mid-century influence, nostalgic colors, rounded forms, playful accents',
      contemporary: 'sleek profiles, refined finishes, modern fixtures, balanced contrast',
      industrial: 'raw materials, metal and concrete, utilitarian fixtures, bold silhouettes',
      executive: 'premium materials, sophisticated palette, statement furniture, polished look',
      'open-plan': 'flexible layout, collaborative zones, airy circulation, cohesive materials',
      rustic: 'natural wood, stone textures, handcrafted feel, earthy palette, rugged charm',
      classic: 'timeless detailing, balanced symmetry, elegant finishes, crown moldings',
      bohemian: 'eclectic patterns, layered textiles, plants, collected objects, vibrant accents',
      country: 'countryside charm, shaker profiles, warm woods, vintage details, natural elements',
      mediterranean: 'terracotta, stone, arches, warm whites, wrought iron, sunlit ambience',
      contemporary_kitchen: 'flat fronts, integrated pulls, quartz counters, under-cabinet lights',
    }

    const roomContext: Record<string, string> = {
      room: 'Maintain the existing room geometry and perspective.',
      living: 'Keep windows, seating layout, and focal wall positions consistent.',
      office: 'Preserve desk position, circulation, and daylight direction for a working space.',
      dining: 'Respect table location, circulation space, and wall positions.',
      kitchen: 'Keep cabinet layout, appliance positions, and work triangle intact.',
    }

    const roomLabel = roomLabelMap[room] || room
    const styleLabel = normalizedStyle ? normalizedStyle.replace('-', ' ') : 'refined'
    const styleDetail = normalizedStyle && styleHints[normalizedStyle] ? styleHints[normalizedStyle] : 'harmonious, realistic interior styling'
    const context = roomContext[room] || 'Maintain the current room geometry and perspective.'

    return [
      `Transform the uploaded ${roomLabel} photo into a ${styleLabel} style real-estate image with realistic results.`,
      `Apply: ${styleDetail}.`,
      context,
      'Do not change room size or camera angle. Keep doors/windows and architecture in place.',
      'Use photorealistic lighting and materials. No text overlays. 16:9 aspect if possible.',
    ].join(' ')
  }

  // Aspect ratio helper for Output Preview box
  const getAspectClass = (ratio: string): string => {
    switch (ratio) {
      case '1:1':
        return 'aspect-[1/1]'
      case '16:9':
        return 'aspect-[16/9]'
      case '4:5':
        return 'aspect-[4/5]'
      case '9:16':
        return 'aspect-[9/16]'
      default:
        return ''
    }
  }

  // Downscale dataURL to max dimension (longer side) and return dataURL
  const downscaleDataUrl = (
    dataUrl: string,
    maxDim = 1024,
    mime = 'image/jpeg',
    quality = 0.92
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        let w = img.width
        let h = img.height
        const longest = Math.max(w, h)
        if (longest > maxDim) {
          const scale = maxDim / longest
          w = Math.round(w * scale)
          h = Math.round(h * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL(mime, quality))
      }
      img.crossOrigin = 'anonymous'
      img.src = dataUrl
    })
  }

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)')
      return false
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return false
    }

    return true
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        handleFile(file)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setError(null)

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        handleFile(file)
      }
    }
  }

  const handleFile = (file: File) => {
    setSelectedFile(file)
    setOutputUrl(null)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    // Open the ratio modal immediately (before preview is ready)
    setAspectModalOpen(true)
    reader.readAsDataURL(file)
  }

  const handleDownload = () => {
    if (!outputUrl) return
    const link = document.createElement('a')
    link.href = outputUrl
    link.download = 'furnifit-output.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    try {
      // Store in localStorage (in production, this would be an API call)
      const uploads = JSON.parse(localStorage.getItem('furnifit_uploads') || '[]')
      const payload = {
        id: Date.now(),
        userId: user?.id,
        filename: selectedFile.name,
        uploadedAt: new Date().toISOString(),
        preview: previewUrl,
        roomType: selectedRoom,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        prompt: getAIPrompt(selectedRoom, selectedStyle),
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
      }
      uploads.push(payload)
      localStorage.setItem('furnifit_uploads', JSON.stringify(uploads))

      try {
        const resizedDataUrl = previewUrl ? await downscaleDataUrl(previewUrl, 1024) : ''
        const previewBase64 = (resizedDataUrl && resizedDataUrl.startsWith('data:'))
          ? resizedDataUrl.split(',')[1]
          : (resizedDataUrl || '')
        const { preview, ...rest } = payload
        const webhookBody = {
          ...rest,
          imageBase64: previewBase64,
        }
        const res = await fetch('https://primary-production-6722.up.railway.app/webhook/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookBody),
        })
        if (!res.ok) {
          setError(`Webhook error: ${res.status} ${res.statusText}`)
          setUploading(false)
          return
        }
        // Try URL from headers first
        let headerUrl: string | null =
          res.headers.get('location') || res.headers.get('x-image-url') || res.headers.get('x-output-url')
        if (headerUrl) {
          setOutputUrl(headerUrl)
          saveHistoryEntry(headerUrl)
          setUploadSuccess(true)
          setUploading(false)
          return
        }
        // If response is already an image or redirected
        const contentType = res.headers.get('content-type') || ''
        if (contentType.startsWith('image/') && res.url) {
          setOutputUrl(res.url)
          saveHistoryEntry(res.url)
          setUploadSuccess(true)
          setUploading(false)
          return
        }
        const raw = await res.text()
        let url: string | null = null
        try {
          const data = JSON.parse(raw)
          url = extractUrl(data)
        } catch {
          url = extractUrl(raw)
        }
        if (url) {
          setOutputUrl(url)
          saveHistoryEntry(url)
          setUploadSuccess(true)
          setUploading(false)
        } else {
          // Could not parse a URL; stop loader and show error
          setError('No output URL found in webhook response.')
          setUploading(false)
        }
      } catch (innerErr) {
        setError('Webhook request failed. Please try again.')
        setUploading(false)
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadSuccess(false)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Upload, label: 'Upload Room', path: '/upload' },
    { icon: ImageIcon, label: 'History', path: '/history' },
  ]
  
  const styleOptionsByRoom: Record<string, Array<{ key: string; label: string; desc: string; icon: any }>> = {
    room: [
      { key: 'modern', label: 'Modern', desc: 'Clean lines and minimalist design', icon: HomeIcon },
      { key: 'cozy', label: 'Cozy', desc: 'Warm tones and comfortable textures', icon: Star },
      { key: 'scandinavian', label: 'Scandinavian', desc: 'Light, airy, and functional', icon: Waves },
      { key: 'minimal', label: 'Minimal', desc: 'Essential forms with ample space', icon: Mountain },
    ],
    living: [
      { key: 'modern', label: 'Modern', desc: 'Clean lines and minimalist design', icon: HomeIcon },
      { key: 'coastal', label: 'Coastal', desc: 'Breezy textures, light palette', icon: Waves },
      { key: 'loft', label: 'Loft', desc: 'Open plan with industrial notes', icon: Mountain },
      { key: 'retro', label: 'Retro', desc: 'Nostalgic forms and colors', icon: Star },
    ],
    office: [
      { key: 'contemporary', label: 'Contemporary', desc: 'Sleek lines and modern finishes', icon: Briefcase },
      { key: 'industrial', label: 'Industrial', desc: 'Raw materials and bold accents', icon: Mountain },
      { key: 'executive', label: 'Executive', desc: 'Premium materials and presence', icon: Star },
      { key: 'open-plan', label: 'Open‑plan', desc: 'Collaborative and flexible layout', icon: Waves },
    ],
    dining: [
      { key: 'rustic', label: 'Rustic', desc: 'Natural wood and earthy textures', icon: Mountain },
      { key: 'modern', label: 'Modern', desc: 'Refined shapes and clean geometry', icon: HomeIcon },
      { key: 'classic', label: 'Classic', desc: 'Timeless forms and detailing', icon: Star },
      { key: 'bohemian', label: 'Bohemian', desc: 'Eclectic patterns and colors', icon: Waves },
    ],
    kitchen: [
      { key: 'modern', label: 'Modern', desc: 'Flat fronts and integrated handles', icon: Utensils },
      { key: 'country', label: 'Country', desc: 'Shaker profiles and warm palette', icon: Mountain },
      { key: 'industrial', label: 'Industrial', desc: 'Metallics and concrete accents', icon: Star },
      { key: 'mediterranean', label: 'Mediterranean', desc: 'Terracotta, stone, and arches', icon: Waves },
    ],
  }
  const styleOptions = styleOptionsByRoom[selectedRoom]

  const roomOptions = [
    { key: 'room', label: 'Room' },
    { key: 'living', label: 'Living' },
    { key: 'office', label: 'Office' },
    { key: 'dining', label: 'Dining' },
    { key: 'kitchen', label: 'Kitchen' },
  ]
  const roomIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    room: HomeIcon,
    living: HomeIcon,
    office: Briefcase,
    dining: Utensils,
    kitchen: Utensils,
  }

  // Removed visual output filter since Output Preview image is hidden for now

  return (
    <div className="min-h-screen bg-background text-white overflow-x-hidden">
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
                      item.path === '/upload'
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
                  item.path === '/upload'
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
        <div className="relative z-10 w-full mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Upload Your <span className="text-gradient">Room Image</span>
            </h2>
            <p className="text-white/70 text-sm sm:text-base">
              Upload a clean room photo to start visualizing furniture options
            </p>
          </div>

          {/* Upload Section - full width */}
          <div className="w-full">
              {!selectedFile ? (
                <div
                  className={`glass-card p-5 sm:p-8 border-2 border-dashed transition-all ${
                    dragActive
                      ? 'border-primary bg-primary/10 scale-105'
                      : 'border-white/20 hover:border-primary/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Upload className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-4">
                      Drop your room image here
                    </h3>
                    <p className="text-white/70 mb-8 text-sm sm:text-base">
                      or click to browse from your device
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-gradient text-sm sm:text-base"
                    >
                      Choose File
                    </button>
                    <p className="text-xs sm:text-sm text-white/50 mt-6">
                      Supported formats: JPEG, PNG, WebP (Max 10MB)
                    </p>

                  </div>
                </div>
              ) : (
                <div className="glass-card p-5 sm:p-8">
                  {/* Preview: Original vs Output */}
                  <div className="mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="glass-card p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white/80">Original</span>
                          {!uploadSuccess && (
                            <button
                              onClick={resetUpload}
                              className="glass-card p-2 hover:bg-white/20 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="relative rounded-xl overflow-hidden bg-black/20">
                          {previewUrl && (
                            <img
                              src={previewUrl}
                              alt="Original preview"
                              className="w-full h-auto max-h-96 object-contain"
                            />
                          )}
                        </div>
                      </div>

                      <div className="glass-card p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white/80">Output Preview</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/60">
                              {selectedRoom}
                              {selectedStyle ? ` · ${selectedStyle}` : ''}
                              {selectedRatio ? ` · ${selectedRatio}` : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAspectModalOpen(true)}
                              className="text-xs px-2 py-1 rounded-md border border-white/15 text-white/70 hover:text-white hover:bg-white/10"
                            >
                              Change Ratio
                            </button>
                          </div>
                        </div>
                        <div className={`relative rounded-xl overflow-hidden bg-black/20 w-full group ${getAspectClass(selectedRatio)}`}>
                          {uploading && (
                            <div className="absolute inset-0 grid place-items-center">
                              <div className="flex flex-col items-center">
                                <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/40 via-white/10 to-secondary/40 blur-xl animate-pulse" />
                                  <div className="absolute inset-0 rounded-full border-2 border-white/20 border-t-primary animate-spin" />
                                  <div className="absolute inset-3 rounded-full border-2 border-white/10 border-l-secondary animate-[spin_2s_linear_infinite_reverse]" />
                                </div>
                                <p className="mt-3 text-xs text-white/70">Generating output...</p>
                              </div>
                            </div>
                          )}
                          {!uploading && outputUrl && (
                            <>
                              <img
                                src={outputUrl}
                                alt="AI output"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={handleDownload}
                                className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {!uploading && error && !outputUrl && (
                            <div className="absolute inset-0 grid place-items-center text-red-300 text-xs sm:text-sm px-4 text-center">
                              {error}
                            </div>
                          )}
                          {!uploading && !outputUrl && (
                            <div className="absolute inset-0 grid place-items-center text-white/60 text-sm">
                              No output yet. Submit to generate preview.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  

                  {/* Action Button */}
                  <div className="flex flex-col gap-4">
                    {!uploadSuccess && (
                      <button
                        onClick={handleUpload}
                        disabled={uploading || !selectedStyle}
                        className="btn-gradient w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {uploading
                          ? 'Submitting...'
                          : !selectedStyle
                            ? 'Choose a style to submit'
                            : 'Submit'}
                      </button>
                    )}
                    {uploadSuccess && (
                      <button
                        onClick={resetUpload}
                        className="btn-gradient w-full text-sm sm:text-base"
                      >
                        Upload Another Image
                      </button>
                    )}
                  </div>

                </div>
              )}

              </div>

              {/* Two-column layout: left Select Area, right details (side-by-side only on xl screens) */}
              <div className="mt-6 sm:mt-8 grid xl:grid-cols-12 gap-6 sm:gap-8 items-stretch">
                {/* Left: Select Area */}
                <div className="xl:col-span-8 h-full">
                  <div className="glass-card p-4 sm:p-6 h-full flex flex-col">
                    <div className="mb-4">
                      <div className="glass-card p-2">
                        <div className="grid grid-cols-3 gap-2">
                          {roomOptions.map((opt) => {
                            const Icon = roomIconMap[opt.key]
                            const active = selectedRoom === opt.key
                            return (
                              <button
                                key={opt.key}
                                onClick={() => setSelectedRoom(opt.key)}
                                className={`flex items-center justify-center gap-2 px-2 py-2 rounded-xl text-center transition-all border ${
                                  active
                                    ? 'bg-gradient-primary text-white border-transparent shadow-[0_0_0_1px_rgba(106,92,255,0.4)]'
                                    : 'border-white/10 text-white/80 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-semibold">{opt.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-4">Select Area</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {styleOptions.map((opt) => {
                        const Icon = opt.icon
                        const active = selectedStyle === opt.key
                        return (
                          <button
                            key={opt.key}
                            onClick={() => setSelectedStyle(opt.key)}
                            className={`text-left w-full rounded-xl p-4 border transition-all group ${
                              active
                                ? 'border-primary bg-white/5 shadow-[0_0_0_1px_rgba(106,92,255,0.4)]'
                                : 'border-white/10 hover:border-primary/50 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-primary/30' : 'bg-white/5'}`}>
                                <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-white/70'}`} />
                              </div>
                              <div>
                                <p className="font-semibold">{opt.label}</p>
                                <p className="text-xs text-white/70">{opt.desc}</p>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    {selectedStyle && (
                      <p className="mt-4 text-xs text-white/60">Selected: <span className="text-white">{selectedStyle}</span></p>
                    )}
                  </div>
                </div>

                {/* Right: Details Panel */}
                <aside className="mt-6 xl:mt-0 xl:col-span-4 neon-scroll h-full">
                  <div className="glass-card p-6 h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-4">Tips for Best Results</h3>
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="glass-card p-4 sm:p-6">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                          <Check className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">Clean & Empty Room</h4>
                        <p className="text-xs sm:text-sm text-white/70">Ensure the room is clean and free of furniture for accurate AI analysis</p>
                      </div>

                      <div className="glass-card p-4 sm:p-6">
                        <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center mb-4">
                          <Check className="w-5 h-5 text-secondary" />
                        </div>
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">Good Lighting</h4>
                        <p className="text-xs sm:text-sm text-white/70">Take photos in natural daylight or with good artificial lighting</p>
                      </div>

                      <div className="glass-card p-4 sm:p-6">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                          <Check className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">Wide Angle</h4>
                        <p className="text-xs sm:text-sm text-white/70">Capture the entire room in a single shot for better space analysis</p>
                      </div>

                      <div className="glass-card p-4 sm:p-6">
                        <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center mb-4">
                          <Check className="w-5 h-5 text-secondary" />
                        </div>
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">High Resolution</h4>
                        <p className="text-xs sm:text-sm text-white/70">Use high-quality images for the most accurate furniture visualization</p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
              {/* Aspect Ratio Modal (global) */}
              {aspectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/60" onClick={() => setAspectModalOpen(false)} />
                  <div className="relative glass-card w-full max-w-xs sm:max-w-sm mx-4 p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-semibold mb-3">Choose Aspect Ratio</h3>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {/* 1:1 */}
                      <button
                        onClick={() => { setSelectedRatio('1:1'); setAspectModalOpen(false); }}
                        className="rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all text-left"
                      >
                        <div className="aspect-[1/1] bg-black/20">
                          {previewUrl ? (
                            <img src={previewUrl} alt="ratio 1:1" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/5 animate-pulse" />
                          )}
                        </div>
                        <div className="px-3 py-1 text-xs text-white/80">1:1</div>
                      </button>

                      {/* 16:9 */}
                      <button
                        onClick={() => { setSelectedRatio('16:9'); setAspectModalOpen(false); }}
                        className="rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all text-left"
                      >
                        <div className="aspect-[16/9] bg-black/20">
                          {previewUrl ? (
                            <img src={previewUrl} alt="ratio 16:9" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/5 animate-pulse" />
                          )}
                        </div>
                        <div className="px-3 py-1 text-xs text-white/80">16:9</div>
                      </button>

                      {/* 4:5 */}
                      <button
                        onClick={() => { setSelectedRatio('4:5'); setAspectModalOpen(false); }}
                        className="rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all text-left"
                      >
                        <div className="aspect-[4/5] bg-black/20">
                          {previewUrl ? (
                            <img src={previewUrl} alt="ratio 4:5" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/5 animate-pulse" />
                          )}
                        </div>
                        <div className="px-3 py-1 text-xs text-white/80">4:5</div>
                      </button>

                      {/* 9:16 */}
                      <button
                        onClick={() => { setSelectedRatio('9:16'); setAspectModalOpen(false); }}
                        className="rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all text-left"
                      >
                        <div className="aspect-[9/16] bg-black/20">
                          {previewUrl ? (
                            <img src={previewUrl} alt="ratio 9:16" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/5 animate-pulse" />
                          )}
                        </div>
                        <div className="px-3 py-1 text-xs text-white/80">9:16</div>
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={() => { setSelectedRatio('original'); setAspectModalOpen(false); }}
                        className="text-xs text-white/80 hover:text-white"
                      >
                        Use Original
                      </button>
                      <button
                        onClick={() => setAspectModalOpen(false)}
                        className="btn-glass text-xs px-3 py-1.5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

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
                onClick={logout}
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
    export default UploadPage
