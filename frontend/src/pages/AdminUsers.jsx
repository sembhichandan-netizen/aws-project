import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import { Users, Search, ShieldCheck, User, Trash2, X } from 'lucide-react'

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await axios.get('/api/admin/users')
    setUsers(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const changeRole = async (id, role) => {
    try {
      await axios.put(`/api/admin/users/${id}/role`, { role })
      toast.success(`Role updated to ${role}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role')
    }
  }

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This action cannot be undone.`)) return
    try {
      await axios.delete(`/api/admin/users/${id}`)
      toast.success('User deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user')
    }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.nationality?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage all registered users and their roles.</p>
        </div>
        <div className="card px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
          <Users size={15} className="text-[hsl(var(--primary))]" />
          <span className="text-sm font-bold text-gray-700">{users.length} Users</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or nationality…"
          className="input pl-10 py-3 text-sm shadow-sm" />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nationality</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Apps</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Docs</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-sm text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[hsl(var(--primary))]">{u.name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-600">{u.nationality || '—'}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-700">{u.application_count}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-700">{u.document_count}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`badge ${u.role === 'admin' ? 'bg-[hsl(var(--muted))] text-[hsl(var(--fg))] border border-[hsl(var(--border))]' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' ? <ShieldCheck size={10} className="inline mr-1" /> : <User size={10} className="inline mr-1" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <select
                        value={u.role}
                        onChange={e => changeRole(u.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button onClick={() => deleteUser(u.id, u.name)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
