import { Link } from 'react-router-dom'
import { Sparkles, Upload, Eye, Palette, Home } from 'lucide-react'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background text-white overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">FurniFit</h1>
          </div>
          <div className="hidden sm:block" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-block glass-card px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8">
              <span className="text-xs sm:text-sm text-secondary font-semibold">AI-Powered Visualization</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
              <span className="text-gradient">FurniFit</span>
              <br />
              <span className="text-white">Perfect Fit,</span>
              <br />
              <span className="text-white/80">Every Space</span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-white/70 mb-8 sm:mb-12 max-w-2xl mx-auto lg:mx-0">
              AI-powered platform to visualize furniture that perfectly fits your space. 
              Transform your room with cutting-edge design visualization.
            </p>
            
            <div className="flex justify-center lg:justify-start">
              <Link
                to="/register"
                className="btn-gradient text-center text-base sm:text-lg glow-primary"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="glass-card p-6 sm:p-8 lg:p-12 glow-secondary">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="glass-card p-4 sm:p-6 hover:bg-white/10 transition-all cursor-pointer group">
                  <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Upload Room</h3>
                  <p className="text-xs sm:text-sm text-white/60">Start with your space</p>
                </div>
                <div className="glass-card p-4 sm:p-6 hover:bg-white/10 transition-all cursor-pointer group">
                  <Eye className="w-8 h-8 sm:w-12 sm:h-12 text-secondary mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Visualize</h3>
                  <p className="text-xs sm:text-sm text-white/60">See the perfect fit</p>
                </div>
                <div className="glass-card p-4 sm:p-6 hover:bg-white/10 transition-all cursor-pointer group">
                  <Palette className="w-8 h-8 sm:w-12 sm:h-12 text-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Design Styles</h3>
                  <p className="text-xs sm:text-sm text-white/60">Explore aesthetics</p>
                </div>
                <div className="glass-card p-4 sm:p-6 hover:bg-white/10 transition-all cursor-pointer group">
                  <Home className="w-8 h-8 sm:w-12 sm:h-12 text-secondary mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Any Room</h3>
                  <p className="text-xs sm:text-sm text-white/60">Bedroom to office</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            How <span className="text-gradient">FurniFit</span> Works
          </h2>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Visualize the perfect furniture fit in just a few simple steps
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="glass-card p-6 sm:p-8 text-center hover:scale-105 transition-transform">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-bold">1</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Upload Your Room</h3>
            <p className="text-sm sm:text-base text-white/70">
              Take a photo of your clean room and upload it to our platform
            </p>
          </div>

          <div className="glass-card p-6 sm:p-8 text-center hover:scale-105 transition-transform">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-bold">2</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">AI Analysis</h3>
            <p className="text-sm sm:text-base text-white/70">
              Our AI analyzes your space dimensions and lighting conditions
            </p>
          </div>

          <div className="glass-card p-6 sm:p-8 text-center hover:scale-105 transition-transform">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-bold">3</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Visualize Furniture</h3>
            <p className="text-sm sm:text-base text-white/70">
              See perfectly fitted furniture options in your actual space
            </p>
          </div>

          <div className="glass-card p-6 sm:p-8 text-center hover:scale-105 transition-transform">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-bold">4</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Perfect Match</h3>
            <p className="text-sm sm:text-base text-white/70">
              Find furniture that fits your space, style, and budget perfectly
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <div className="glass-card p-6 sm:p-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">About <span className="text-gradient">FurniFit</span></h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              FurniFit helps you visualize furniture that perfectly fits your unique space. Upload a
              clean room photo and explore AI-guided options that consider dimensions, layout, and lighting.
              Our futuristic, minimalist design keeps your focus on what matters: creating beautiful, livable spaces.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
              <div className="glass-card p-4">
                <p className="text-sm sm:text-base font-semibold">Mobile‑first and Ultra‑responsive</p>
                <p className="text-xs sm:text-sm text-white/70 mt-1">Looks stunning from 320px phones to 2560px ultrawides.</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-sm sm:text-base font-semibold">Clean Upload Experience</p>
                <p className="text-xs sm:text-sm text-white/70 mt-1">Drag & drop, instant previews, and clear validation.</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-sm sm:text-base font-semibold">Guided Visualization</p>
                <p className="text-xs sm:text-sm text-white/70 mt-1">Explore styles and see what truly fits your room.</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-sm sm:text-base font-semibold">Privacy‑friendly Demo</p>
                <p className="text-xs sm:text-sm text-white/70 mt-1">Data stays in your browser for this demo experience.</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 sm:p-10 flex flex-col justify-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Why FurniFit?</h3>
            <ul className="space-y-3 text-white/80 text-sm sm:text-base">
              <li className="list-disc list-inside">Reduce guesswork with spatially aware recommendations.</li>
              <li className="list-disc list-inside">Preview multiple styles without moving a single item.</li>
              <li className="list-disc list-inside">Aesthetic, distraction‑free UI focused on your space.</li>
              <li className="list-disc list-inside">Designed with accessibility, clarity, and speed in mind.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
        <div className="glass-card p-8 sm:p-12 lg:p-16 text-center glow-primary">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Ready to Transform Your Space?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/70 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Join thousands of users who are visualizing their perfect furniture fit with FurniFit
          </p>
          <Link
            to="/register"
            className="btn-gradient text-base sm:text-lg inline-block"
          >
            Start Visualizing Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm sm:text-base text-white/50 text-center sm:text-left">
              &copy; 2024 FurniFit. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm sm:text-base text-white/70 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm sm:text-base text-white/70 hover:text-white transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
