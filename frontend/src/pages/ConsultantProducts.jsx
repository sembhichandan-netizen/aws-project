import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X, Save, Star, Briefcase, Users } from 'lucide-react'

const CATS = ['Full Application','Coaching','Documentation','Visa Assistance','Consultation']
const CURRENCIES = ['INR','CAD','AUD','GBP','EUR','USD']
const EMPTY = { title:'', category:'Full Application', description:'', price:'', currency:'INR', duration:'', countries:'', tags:'', featured:false }

export default function ConsultantProducts() {
  const [services,  setServices]  = useState([])
  const [inquiries, setInquiries] = useState([])
  const [modal,     setModal]     = useState(null)
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [loading,   setLoading]   = useState(true)

  const load = async () => {
    const [sv, inq] = await Promise.all([
      axios.get('/api/services/mine/list'),
      axios.get('/api/services/inquiries/mine'),
    ])
    setServices(sv.data); setInquiries(inq.data); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const openAdd  = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (s) => { setForm({...s, featured:!!s.featured}); setModal(s) }
  const close    = () => { setModal(null); setForm(EMPTY) }

  const save = async () => {
    if (!form.title || !form.category) { toast.error('Title and category required'); return }
    setSaving(true)
    try {
      if (modal === 'add') {
        await axios.post('/api/services', form)
        toast.success('Service published!')
      } else {
        await axios.put(`/api/services/${form.id}`, { ...form, active: 1 })
        toast.success('Service updated!')
      }
      close(); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Remove this service from the marketplace?')) return
    await axios.delete(`/api/services/${id}`)
    toast.success('Service removed'); load()
  }

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Services</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage the services you offer on the AVA marketplace.</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={15}/> Add Service</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:'Published Services', value:services.filter(s=>s.active).length, icon:Briefcase, color:'bg-[hsl(var(--primary))]' },
          { label:'Total Inquiries',    value:inquiries.length,                     icon:Users,     color:'bg-[hsl(var(--primary))]' },
          { label:'Featured Listings',  value:services.filter(s=>s.featured).length,icon:Star,      color:'bg-amber-500' },
        ].map(({label,value,icon:Icon,color}) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={19} className="text-white"/>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={close}>
          <div className="card max-w-2xl w-full p-7 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900">{modal==='add'?'Add New Service':'Edit Service'}</h2>
              <button onClick={close} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18}/></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Service Title *</label>
                <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Canada PR — Express Entry End-to-End" className="input"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Category *</label>
                <select value={form.category} onChange={e=>set('category',e.target.value)} className="input">
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Price</label>
                  <input value={form.price} onChange={e=>set('price',e.target.value)} placeholder="45000" className="input"/>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Currency</label>
                  <select value={form.currency} onChange={e=>set('currency',e.target.value)} className="input">
                    {CURRENCIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Duration</label>
                <input value={form.duration} onChange={e=>set('duration',e.target.value)} placeholder="e.g. 3-4 months" className="input"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Countries</label>
                <input value={form.countries} onChange={e=>set('countries',e.target.value)} placeholder="Canada, Australia, UK" className="input"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Description</label>
                <textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={4} className="input resize-none" placeholder="What does this service include? Who is it for?"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Tags (comma separated)</label>
                <input value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="Canada, Express Entry, PR" className="input"/>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" id="featured" checked={!!form.featured} onChange={e=>set('featured',e.target.checked)} className="w-4 h-4 accent-[hsl(var(--primary))]"/>
                <label htmlFor="featured" className="text-sm font-semibold text-gray-700">Mark as Featured</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={close} className="btn-secondary flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={14}/> {modal==='add'?'Publish Service':'Save Changes'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Services List */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold text-gray-900 mb-4">Published Services</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse"/>)}</div>
          ) : services.length === 0 ? (
            <div className="card py-16 text-center">
              <Briefcase size={32} className="text-gray-200 mx-auto mb-3"/>
              <p className="text-sm text-gray-400">No services yet. Add your first service!</p>
            </div>
          ) : services.map(s => (
            <div key={s.id} className="card p-5 mb-3 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{s.title}</p>
                    {s.featured && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600"><Star size={9} fill="currentColor"/>Featured</span>}
                    {!s.active && <span className="badge bg-gray-100 text-gray-400 text-[10px]">Inactive</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-1.5">{s.category} · {s.duration||'—'} · {s.countries||'All'}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">{s.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-black text-[hsl(var(--fg))]">{s.currency} {Number(s.price).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-gray-400">{s.inquiry_count} enquiries</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={()=>openEdit(s)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><Edit2 size={11}/> Edit</button>
                <button onClick={()=>remove(s.id)} className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1"><Trash2 size={11}/> Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Inquiries */}
        <div className="card p-5 self-start">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Inquiries ({inquiries.length})</h3>
          {inquiries.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No inquiries yet.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
              {inquiries.map(inq => (
                <div key={inq.id} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-800">{inq.student_name}</p>
                  <p className="text-[10px] text-[hsl(var(--primary))] mb-1">{inq.service_title}</p>
                  {inq.message && <p className="text-xs text-gray-600 italic line-clamp-2">"{inq.message}"</p>}
                  <p className="text-[9px] text-gray-400 mt-1">{new Date(inq.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
