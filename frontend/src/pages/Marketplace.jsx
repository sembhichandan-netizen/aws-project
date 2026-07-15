import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search, X, Briefcase, Clock, Globe, Star, ChevronRight, Send, Filter } from 'lucide-react'

const CATS = ['All','Full Application','Coaching','Documentation','Visa Assistance','Consultation']
const COUNTRIES = ['All Countries','Canada','Australia','United Kingdom','Germany','New Zealand','United States']
const CAT_COLOR = {
  'Full Application': 'bg-[hsl(var(--muted))] text-[hsl(var(--fg))]',
  'Coaching':         'bg-[hsl(var(--muted))] text-[hsl(var(--fg))]',
  'Documentation':    'bg-amber-50 text-amber-700',
  'Visa Assistance':  'bg-blue-50 text-blue-700',
  'Consultation':     'bg-emerald-50 text-emerald-700',
}

function InquiryModal({ service, onClose, onSubmit }) {
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      await onSubmit(service.id, msg)
      onClose()
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="card max-w-lg w-full p-7 animate-slide-up" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-black text-gray-900 mb-1">Enquire About Service</h2>
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-semibold text-gray-700">{service.title}</span> by {service.consultant_name}
        </p>
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-gray-500 mb-1">Service Fee</p>
          <p className="text-2xl font-black text-[hsl(var(--fg))]">{service.currency} {service.price}</p>
          {service.duration && <p className="text-xs text-gray-400 mt-0.5">Duration: {service.duration}</p>}
        </div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Your Message (optional)</label>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3} className="input text-sm resize-none mb-5"
          placeholder="Tell the consultant about your profile, questions, or any specific requirements…" />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={14}/> Send Enquiry</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Marketplace() {
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [cat,      setCat]      = useState('All')
  const [country,  setCountry]  = useState('All Countries')
  const [modal,    setModal]    = useState(null)

  const load = async () => {
    const params = {}
    if (cat !== 'All') params.category = cat
    if (country !== 'All Countries') params.country = country
    if (search) params.search = search
    const { data } = await axios.get('/api/services', { params })
    setServices(data); setLoading(false)
  }

  useEffect(() => { load() }, [cat, country])

  const submitInquiry = async (id, msg) => {
    try {
      await axios.post(`/api/services/${id}/inquire`, { message: msg })
      toast.success('Enquiry sent! The consultant will contact you via chat.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send enquiry')
      throw err
    }
  }

  const featured = services.filter(s => s.featured)
  const regular  = services.filter(s => !s.featured)

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Services Marketplace</h1>
        <p className="text-gray-500 text-sm mt-0.5">Browse services offered by our qualified immigration consultants.</p>
      </div>

      {/* Search + Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==='Enter' && load()}
              placeholder="Search services, keywords…" className="input pl-10 text-sm" />
            {search && <button onClick={() => { setSearch(''); load() }} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-gray-400" /></button>}
          </div>
          <select value={country} onChange={e => setCountry(e.target.value)} className="input md:w-44 text-sm">
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={load} className="btn-primary text-sm px-5">
            <Filter size={14}/> Filter
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mt-3">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${cat===c?'bg-[hsl(var(--primary))] text-white shadow-md':'bg-gray-100 text-gray-600 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {modal && <InquiryModal service={modal} onClose={() => setModal(null)} onSubmit={submitInquiry} />}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Featured */}
          {featured.length > 0 && cat === 'All' && (
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-4">
                <Star size={15} className="text-amber-500" fill="currentColor" />
                <h2 className="text-base font-bold text-gray-900">Featured Services</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map(s => <ServiceCard key={s.id} service={s} onEnquire={() => setModal(s)} />)}
              </div>
            </div>
          )}

          {/* All services */}
          {regular.length > 0 && (
            <>
              <h2 className="text-base font-bold text-gray-900 mb-4">{cat === 'All' ? 'All Services' : cat} {country !== 'All Countries' ? `— ${country}` : ''}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(cat === 'All' ? regular : services).map(s => <ServiceCard key={s.id} service={s} onEnquire={() => setModal(s)} />)}
              </div>
            </>
          )}

          {services.length === 0 && (
            <div className="card py-20 text-center">
              <Briefcase size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No services found for your filters.</p>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}

function ServiceCard({ service, onEnquire }) {
  return (
    <div className="card p-5 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <span className={`badge text-[10px] font-bold border ${CAT_COLOR[service.category] || 'bg-gray-100 text-gray-600'}`}>{service.category}</span>
        {service.featured && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600"><Star size={10} fill="currentColor"/>Featured</span>}
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-2 leading-tight">{service.title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-3">{service.description}</p>

      <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 border-t border-gray-50 pt-3">
        {service.duration && <span className="flex items-center gap-1"><Clock size={11}/> {service.duration}</span>}
        {service.countries && <span className="flex items-center gap-1 truncate"><Globe size={11}/> {service.countries.split(',')[0]}</span>}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-black text-[hsl(var(--fg))]">{service.currency} {Number(service.price).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-400">by {service.consultant_name}</p>
        </div>
        <button onClick={onEnquire} className="btn-primary text-xs px-4 py-2">
          Enquire <ChevronRight size={12}/>
        </button>
      </div>
    </div>
  )
}
