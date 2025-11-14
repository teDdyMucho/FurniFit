const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Terms & Conditions</h1>
        <div className="max-w-3xl text-white/80 space-y-6">
          <p>
            FurniFit is provided as a demo experience. By using this site you agree that any content
            you upload is stored only in your browser for preview purposes and not transmitted to a server.
          </p>
          <ol className="list-decimal pl-6 space-y-3">
            <li>Use this experience responsibly and only with images you own the rights to.</li>
            <li>Do not upload sensitive or personal data. Remove any private information from images.</li>
            <li>The UI and features are for demonstration and may change without notice.</li>
            <li>There are no warranties; use is at your own risk.</li>
          </ol>
          <p>
            For production use, a proper backend, authentication, and data retention policy must be implemented.
          </p>
        </div>
      </main>
    </div>
  )
}

export default TermsPage
