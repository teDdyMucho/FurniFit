const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-invert max-w-3xl text-white/80">
          <p>
            We respect your privacy. This demo stores minimal information locally in your browser
            (localStorage) only to support authentication and uploads. No data is transmitted to a server.
          </p>
          <h2>What we store</h2>
          <ul>
            <li>Basic account info you provide: name and email</li>
            <li>Room image previews for your uploads</li>
            <li>Session status for staying signed in</li>
          </ul>
          <h2>Your control</h2>
          <p>
            You can clear your data anytime by logging out and clearing your browser storage. For a
            production deployment, replace local storage with a secure backend and database.
          </p>
        </div>
      </main>
    </div>
  )
}

export default PrivacyPage
