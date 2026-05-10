import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[hsl(222,47%,11%)] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">
          Placement<span className="text-blue-400">Prep</span>
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          🎓 Built for UK university students
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Stop guessing.
          <br />
          <span className="text-blue-400">Start converting.</span>
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
          PlacementPrep tracks every application, maps your conversion funnel, and gives
          you weekly AI insights so you can improve your strategy — not just apply more.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-blue-500 hover:bg-blue-600 text-white px-7 py-3 rounded-lg text-base font-semibold transition-colors"
          >
            Start tracking for free
          </Link>
          <Link
            href="/login"
            className="text-white/60 hover:text-white text-base transition-colors"
          >
            Already have an account →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: '📊',
            title: 'Application Funnel',
            desc: 'See exactly where you drop off — Applied → OA → Interview → Offer — across every company and sector.',
          },
          {
            icon: '🤖',
            title: 'Weekly AI Insights',
            desc: 'Every week, get a personalised summary of what\'s working, what\'s weak, and what to do next.',
          },
          {
            icon: '📅',
            title: 'Deadline Tracker',
            desc: 'Never miss a deadline. See upcoming closes and get alerts for stale applications.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-colors"
          >
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="text-base font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="text-center text-sm text-white/30 pb-12">
        © {new Date().getFullYear()} PlacementPrep · Built for students, by students
      </footer>
    </main>
  );
}
