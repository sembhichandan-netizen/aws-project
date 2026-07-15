import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, FileCheck, BookOpen, FileText, Globe,
  ClipboardList, Users, LogOut, Plane, Mic, Map,
  GraduationCap, MessageSquare, Activity, Briefcase,
  ShoppingBag, TrendingUp, Network
} from 'lucide-react'

const NAV = {
  user: [
    { section:'Overview', links:[
      { to:'/dashboard',          icon:LayoutDashboard, label:'Dashboard' },
    ]},
    { section:'Immigration', links:[
      { to:'/programs',           icon:Globe,           label:'Visa Programs' },
      { to:'/marketplace',        icon:ShoppingBag,     label:'Services' },
      { to:'/eligibility',        icon:FileCheck,       label:'Eligibility Check' },
      { to:'/applications',       icon:ClipboardList,   label:'My Applications' },
    ]},
    { section:'Documents', links:[
      { to:'/documents',          icon:FileText,        label:'Documents' },
      { to:'/document-readiness', icon:FileCheck,       label:'Readiness Check' },
    ]},
    { section:'Learning', links:[
      { to:'/learning',           icon:BookOpen,        label:'Learning Hub' },
      { to:'/learning/ielts',     icon:GraduationCap,   label:'IELTS Prep' },
      { to:'/learning/interview', icon:Mic,             label:'Interview Prep' },
      { to:'/learning/roadmap',   icon:Map,             label:'Roadmap' },
    ]},
    { section:'Support', links:[
      { to:'/chat',               icon:MessageSquare,   label:'Chat' },
    ]},
  ],
  admin: [
    { section:'Overview', links:[
      { to:'/admin',              icon:LayoutDashboard, label:'Dashboard' },
    ]},
    { section:'Management', links:[
      { to:'/admin/users',        icon:Users,           label:'Users' },
      { to:'/admin/visa',         icon:Globe,           label:'Visa Programs' },
      { to:'/admin/documents',    icon:FileText,        label:'Documents' },
    ]},
    { section:'Communication', links:[
      { to:'/admin/messages',     icon:MessageSquare,   label:'Messages' },
    ]},
    { section:'Analytics', links:[
      { to:'/admin/activity',     icon:Activity,        label:'Activity' },
      { to:'/admin/progress',     icon:TrendingUp,      label:'Progress Report' },
    ]},
  ],
  consultant: [
    { section:'Overview', links:[
      { to:'/consultant',          icon:Briefcase,      label:'Dashboard' },
    ]},
    { section:'My Business', links:[
      { to:'/consultant/products', icon:ShoppingBag,    label:'My Services' },
      { to:'/consultant/b2b',      icon:Network,        label:'Connect Consultants' },
    ]},
    { section:'Communication', links:[
      { to:'/consultant/messages', icon:MessageSquare,  label:'Student Chat' },
    ]},
    { section:'Browse', links:[
      { to:'/programs',            icon:Globe,          label:'Visa Programs' },
    ]},
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const sections = NAV[user?.role] || NAV.user
  const initials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/') }

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 flex flex-col z-40"
      style={{ background:'hsl(var(--muted))', borderRight:'1px solid hsl(var(--border))' }}>

      <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom:'1px solid hsl(var(--border))' }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background:'hsl(var(--primary))' }}>
          <Plane size={13} className="rotate-45" style={{ color:'hsl(var(--primary-fg))' }}/>
        </div>
        <span className="font-semibold text-sm" style={{ color:'hsl(var(--fg))' }}>AVA Immigration</span>
      </div>

      <div className="px-4 py-3" style={{ borderBottom:'1px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{ background:'hsl(var(--primary))', color:'hsl(var(--primary-fg))' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color:'hsl(var(--fg))' }}>{user?.name}</p>
            <p className="text-[10px] truncate capitalize" style={{ color:'hsl(var(--muted-fg))' }}>{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 space-y-5">
        {sections.map(({ section, links }) => (
          <div key={section}>
            <p className="text-[9px] font-semibold uppercase tracking-widest px-2 mb-1.5"
              style={{ color:'hsl(var(--muted-fg))' }}>
              {section}
            </p>
            <div className="space-y-0.5">
              {links.map(({ to, icon:Icon, label }) => (
                <NavLink key={to+label} to={to}
                  end={['/admin','/dashboard','/learning','/consultant'].includes(to)}
                  style={({ isActive }) => ({
                    display:'flex', alignItems:'center', gap:'0.5rem',
                    padding:'0.375rem 0.625rem',
                    borderRadius:'calc(var(--radius) - 1px)',
                    fontSize:'0.8125rem',
                    fontWeight: isActive ? '600' : '400',
                    textDecoration:'none',
                    background: isActive ? 'hsl(var(--bg))' : 'transparent',
                    color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--fg))',
                    boxShadow: isActive ? 'var(--card-shadow)' : 'none',
                    transition:'background 0.1s, color 0.1s',
                  })}>
                  {({ isActive }) => (
                    <>
                      <Icon size={13} style={{ color:isActive?'hsl(var(--primary))':'hsl(var(--muted-fg))', flexShrink:0 }}/>
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4 pt-2" style={{ borderTop:'1px solid hsl(var(--border))' }}>
        <button onClick={handleLogout}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.5rem',
            padding:'0.375rem 0.625rem', background:'none', border:'none', cursor:'pointer',
            fontSize:'0.8125rem', color:'hsl(var(--muted-fg))', borderRadius:'var(--radius)',
            transition:'background 0.1s, color 0.1s' }}
          onMouseEnter={e=>{ e.currentTarget.style.background='hsl(var(--bg))'; e.currentTarget.style.color='hsl(0 72% 51%)' }}
          onMouseLeave={e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.color='hsl(var(--muted-fg))' }}>
          <LogOut size={13}/> Sign Out
        </button>
      </div>
    </aside>
  )
}
