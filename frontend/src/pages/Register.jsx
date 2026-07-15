import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowLeft, UserPlus, User, Briefcase } from 'lucide-react'

const NATIONALITIES = ['Indian','Bangladeshi','Pakistani','Sri Lankan','Nepali','Filipino','Nigerian','Other']
const ROLES = [
  { key:'user',       label:'Student',    icon:User,     desc:'Check eligibility, learn and apply for visas.' },
  { key:'consultant', label:'Consultant', icon:Briefcase,desc:'Post services and connect with students.' },
]
const ROLE_HOME = { user:'/dashboard', consultant:'/consultant' }

export default function Register() {
  const [role,    setRole]    = useState(null)
  const [form,    setForm]    = useState({ name:'', email:'', password:'', phone:'', nationality:'Indian' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async (e) => {
    e.preventDefault()
    if (!role) { toast.error('Please select Student or Consultant'); return }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const user = await register({ ...form, role: role.key })
      toast.success(`Welcome to AVA, ${user.name}!`)
      navigate(ROLE_HOME[user.role] || '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background:'hsl(var(--muted))' }}>
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm mb-6" style={{ color:'hsl(var(--muted-fg))' }}>
            <ArrowLeft size={13}/> Back to sign in
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm mt-1" style={{ color:'hsl(var(--muted-fg))' }}>Choose your role to get started.</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {ROLES.map(r => {
            const Icon = r.icon
            const isActive = role?.key === r.key
            return (
              <button key={r.key} onClick={()=>setRole(r)} style={{
                textAlign:'left', padding:'1rem', background:'hsl(var(--bg))',
                border:`1px solid ${isActive?'hsl(var(--primary))':'hsl(var(--border))'}`,
                borderRadius:'var(--radius)', cursor:'pointer',
                boxShadow: isActive ? 'var(--card-shadow)' : 'none', transition:'border-color 0.15s',
              }}>
                <div className="w-8 h-8 rounded-md flex items-center justify-center mb-2.5"
                  style={{ background:isActive?'hsl(var(--primary))':'hsl(var(--muted))' }}>
                  <Icon size={15} style={{ color:isActive?'hsl(var(--primary-fg))':'hsl(var(--muted-fg))' }}/>
                </div>
                <p className="text-sm font-semibold" style={{ color:'hsl(var(--fg))' }}>{r.label}</p>
                <p className="text-xs mt-0.5" style={{ color:'hsl(var(--muted-fg))', lineHeight:1.5 }}>{r.desc}</p>
              </button>
            )
          })}
        </div>

        <div className="card p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Full Name *</label>
              <input required value={form.name} onChange={e=>set('name',e.target.value)}
                placeholder="As per passport" className="input" autoFocus/>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Email *</label>
              <input type="email" required value={form.email} onChange={e=>set('email',e.target.value)}
                placeholder="your@email.com" className="input"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Phone</label>
                <input value={form.phone} onChange={e=>set('phone',e.target.value)}
                  placeholder="+91 98765…" className="input"/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Nationality</label>
                <select value={form.nationality} onChange={e=>set('nationality',e.target.value)} className="input">
                  {NATIONALITIES.map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Password *</label>
              <div className="relative">
                <input type={showPw?'text':'password'} required minLength={8}
                  value={form.password} onChange={e=>set('password',e.target.value)}
                  placeholder="Minimum 8 characters" className="input pr-10"/>
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{
                  background:'none', border:'none', cursor:'pointer', color:'hsl(var(--muted-fg))',
                  position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)'
                }}>{showPw?<EyeOff size={14}/>:<Eye size={14}/>}</button>
              </div>
            </div>
            <button type="submit" disabled={loading||!role} className="btn-primary w-full py-2.5">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <><UserPlus size={14}/> Create {role?.label||''} account</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color:'hsl(var(--muted-fg))' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'hsl(var(--primary))' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
