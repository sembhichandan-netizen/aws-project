import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn, ArrowLeft, ShieldCheck, Briefcase, User, UserPlus, ChevronRight } from 'lucide-react'

const ROLES = [
  { key:'admin',      label:'Administrator', icon:ShieldCheck, desc:'Full platform management',          emailHint:'admin@ava.com',      passHint:'admin123' },
  { key:'consultant', label:'Consultant',     icon:Briefcase,   desc:'Post services, connect, chat',      emailHint:'consultant@ava.com', passHint:'consultant123' },
  { key:'user',       label:'Student',        icon:User,        desc:'Check eligibility, learn, apply',   emailHint:'',                  passHint:'' },
]
const ROLE_HOME = { admin:'/admin', consultant:'/consultant', user:'/dashboard' }

export default function Login() {
  const [selected, setSelected] = useState(null)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const pick = (role) => { setSelected(role); setEmail(role.emailHint || ''); setPassword('') }

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.name}`)
      navigate(ROLE_HOME[user.role] || '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background:'hsl(var(--muted))' }}>
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm mb-6" style={{ color:'hsl(var(--muted-fg))' }}>
            <ArrowLeft size={13}/> Home
          </Link>
          <h1 className="text-2xl font-bold">Sign in to AVA</h1>
          <p className="text-sm mt-1" style={{ color:'hsl(var(--muted-fg))' }}>Select your role to continue.</p>
        </div>

        <div className="space-y-2 mb-6">
          {ROLES.map(role => {
            const Icon = role.icon
            const isActive = selected?.key === role.key
            return (
              <button key={role.key} onClick={() => pick(role)} style={{
                width:'100%', display:'flex', alignItems:'center', gap:'0.75rem',
                padding:'0.75rem 1rem', textAlign:'left', background:'hsl(var(--bg))',
                border:`1px solid ${isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                borderRadius:'var(--radius)', cursor:'pointer',
                boxShadow: isActive ? 'var(--card-shadow)' : 'none', transition:'border-color 0.15s',
              }}>
                <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}>
                  <Icon size={15} style={{ color: isActive ? 'hsl(var(--primary-fg))' : 'hsl(var(--muted-fg))' }}/>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color:'hsl(var(--fg))' }}>{role.label}</p>
                  <p className="text-xs" style={{ color:'hsl(var(--muted-fg))' }}>{role.desc}</p>
                </div>
                {isActive && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:'hsl(var(--primary))' }}/>}
              </button>
            )
          })}
        </div>

        {selected && (
          <div className="card p-6">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder={selected.emailHint || 'your@email.com'} className="input" autoFocus/>
                {selected.passHint && (
                  <p className="text-xs mt-1" style={{color:'hsl(var(--muted-fg))'}}>
                    Default: {selected.emailHint} / {selected.passHint}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw?'text':'password'} required value={password}
                    onChange={e=>setPassword(e.target.value)} placeholder="Your password" className="input pr-10"/>
                  <button type="button" onClick={()=>setShowPw(p=>!p)} style={{
                    background:'none', border:'none', cursor:'pointer', color:'hsl(var(--muted-fg))',
                    position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)'
                  }}>{showPw?<EyeOff size={14}/>:<Eye size={14}/>}</button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><LogIn size={14}/> Sign in</>}
              </button>
            </form>
          </div>
        )}

        <div className="mt-5" style={{ borderTop:'1px solid hsl(var(--border))', paddingTop:'1.25rem' }}>
          <p className="text-xs text-center mb-3" style={{ color:'hsl(var(--muted-fg))' }}>Don't have an account?</p>
          <Link to="/register" style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:'0.375rem',
            padding:'0.625rem 1rem', width:'100%', background:'hsl(var(--bg))',
            border:'1px dashed hsl(var(--border))', borderRadius:'var(--radius)',
            textDecoration:'none', fontSize:'0.875rem', fontWeight:'500', color:'hsl(var(--fg))',
          }}
            onMouseEnter={e=>e.currentTarget.style.background='hsl(var(--muted))'}
            onMouseLeave={e=>e.currentTarget.style.background='hsl(var(--bg))'}>
            <UserPlus size={13}/> Create account as Student or Consultant <ChevronRight size={12}/>
          </Link>
        </div>

      </div>
    </div>
  )
}
