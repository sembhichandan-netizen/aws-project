import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const PAGE_LABELS = {
  '/dashboard':          'Dashboard',
  '/programs':           'Browsing Visa Programs',
  '/eligibility':        'Eligibility Assessment',
  '/applications':       'My Applications',
  '/documents':          'Managing Documents',
  '/chat':               'Chatting with Consultant',
  '/learning':           'Learning Hub',
  '/learning/ielts':     'IELTS Preparation',
  '/learning/interview': 'Interview Preparation',
  '/learning/roadmap':   'Immigration Roadmap',
}

export default function ActivityPing() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!user || user.role !== 'user') return

    const label = PAGE_LABELS[pathname] || (pathname.startsWith('/learning/module') ? 'Studying Module' : pathname)

    const ping = () => {
      axios.post('/api/activity/ping', { page: label }).catch(() => {})
    }

    // Log page visit
    axios.post('/api/activity/log', { action: 'page_visit', detail: label }).catch(() => {})

    ping()
    const interval = setInterval(ping, 60_000)
    return () => clearInterval(interval)
  }, [user, pathname])

  return null
}
