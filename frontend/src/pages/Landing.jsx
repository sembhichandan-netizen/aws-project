import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, FileCheck, BookOpen, Globe, FileText, CheckCircle } from 'lucide-react'

const FEATURES = [
  { icon: FileCheck, title: 'Eligibility Assessment', desc: 'Answer 8 questions and get a scored profile matched against visa programs worldwide.' },
  { icon: Globe,     title: 'Visa Program Explorer', desc: 'Browse, compare and apply to immigration pathways for Canada, Australia, UK, Germany and more.' },
  { icon: BookOpen,  title: 'Learning Resources',    desc: 'Structured IELTS guides, interview preparation, and country-specific immigration roadmaps.' },
  { icon: FileText,  title: 'Document Management',   desc: 'Upload, organise and track every document. Consultants review and verify them for you.' },
]

const STEPS = [
  { n: '1', title: 'Create an account',   desc: 'Register as a student or consultant in under a minute.' },
  { n: '2', title: 'Check eligibility',   desc: 'Get an instant score and matched visa programs.' },
  { n: '3', title: 'Prepare and learn',   desc: 'IELTS guides, interview coaching and roadmaps.' },
  { n: '4', title: 'Apply and track',     desc: 'Submit applications and monitor each status in real time.' },
]

const PROGRAMS = [
  { flag: '🇨🇦', country: 'Canada',         type: 'Express Entry' },
  { flag: '🇦🇺', country: 'Australia',       type: 'Skilled Migration' },
  { flag: '🇬🇧', country: 'United Kingdom',  type: 'Skilled Worker' },
  { flag: '🇩🇪', country: 'Germany',         type: 'Job Seeker Visa' },
  { flag: '🇳🇿', country: 'New Zealand',     type: 'Skilled Migrant' },
  { flag: '🇺🇸', country: 'United States',   type: 'EB-3 Sponsored' },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div style={{ background: 'hsl(var(--bg))', color: 'hsl(var(--fg))' }}>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--bg) / 0.9)', backdropFilter: 'blur(8px)' }}
        className="sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold text-sm" style={{ color: 'hsl(var(--fg))' }}>
            AVA Immigration
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : user.role === 'consultant' ? '/consultant' : '/dashboard'}
                className="btn-primary text-sm px-3.5 py-1.5">
                Dashboard <ArrowRight size={13} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm" style={{ color: 'hsl(var(--muted-fg))' }}
                  onMouseEnter={e => e.target.style.color='hsl(var(--fg))'}
                  onMouseLeave={e => e.target.style.color='hsl(var(--muted-fg))'}>
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm px-3.5 py-1.5">Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-28 md:py-36">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'hsl(var(--fg))', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Your immigration journey, simplified.
          </h1>
          <p className="text-lg mb-10" style={{ color: 'hsl(var(--muted-fg))', lineHeight: 1.7 }}>
            Eligibility assessment, IELTS preparation, document tracking and visa program applications — all in one platform built for Indian applicants.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="btn-primary px-5 py-2.5 text-sm">
              Start free assessment <ArrowRight size={14} />
            </Link>
            <Link to="/login" className="btn-secondary px-5 py-2.5 text-sm">Sign in</Link>
          </div>
          <p className="mt-5 text-xs" style={{ color: 'hsl(var(--muted-fg))' }}>Free to join. No credit card required.</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20" style={{ background: 'hsl(var(--muted))' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Everything in one place</h2>
          <p className="text-center mb-14 text-sm" style={{ color: 'hsl(var(--muted-fg))' }}>
            From eligibility check to application submission — AVA covers every step.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'hsl(var(--accent-bg))' }}>
                  <Icon size={18} style={{ color: 'hsl(var(--accent-fg))' }} />
                </div>
                <h3 className="font-semibold text-sm mb-2">{title}</h3>
                <p className="text-sm" style={{ color: 'hsl(var(--muted-fg))', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Available programs</h2>
          <p className="text-center mb-12 text-sm" style={{ color: 'hsl(var(--muted-fg))' }}>
            Major immigration pathways currently in the platform.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROGRAMS.map(({ flag, country, type }) => (
              <div key={country} className="card p-4 flex items-center gap-3">
                <span className="text-2xl">{flag}</span>
                <div>
                  <p className="text-sm font-semibold">{country}</p>
                  <p className="text-xs" style={{ color: 'hsl(var(--muted-fg))' }}>{type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20" style={{ background: 'hsl(var(--muted))' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">How it works</h2>
          <p className="text-center mb-14 text-sm" style={{ color: 'hsl(var(--muted-fg))' }}>
            Four simple steps from sign-up to application.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold mb-4"
                  style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-fg))' }}>
                  {n}
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                <p className="text-sm" style={{ color: 'hsl(var(--muted-fg))', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Begin your journey</h2>
          <p className="mb-8 text-sm" style={{ color: 'hsl(var(--muted-fg))' }}>
            Create a free account and get a personalised eligibility report in minutes.
          </p>
          <Link to="/register" className="btn-primary px-6 py-2.5 text-sm">
            Create free account <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid hsl(var(--border))' }} className="px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-sm font-semibold">AVA Immigration Solutions</span>
          <p className="text-xs" style={{ color: 'hsl(var(--muted-fg))' }}>
            © 2026 · Department of Computer Science, Guru Nanak Dev University, Amritsar
          </p>
        </div>
      </footer>

    </div>
  )
}
