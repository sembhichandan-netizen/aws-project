import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ActivityPing from './components/ActivityPing'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import EligibilityAssessment from './pages/EligibilityAssessment'
import LearningHub from './pages/LearningHub'
import ModuleDetail from './pages/ModuleDetail'
import IELTSPrep from './pages/IELTSPrep'
import InterviewPrep from './pages/InterviewPrep'
import Roadmap from './pages/Roadmap'
import Documents from './pages/Documents'
import VisaPrograms from './pages/VisaPrograms'
import Applications from './pages/Applications'
import StudentChat from './pages/StudentChat'
import Marketplace from './pages/Marketplace'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminVisa from './pages/AdminVisa'
import AdminDocuments from './pages/AdminDocuments'
import AdminMessages from './pages/AdminMessages'
import AdminActivity from './pages/AdminActivity'
import ConsultantDashboard from './pages/ConsultantDashboard'
import ConsultantMessages from './pages/ConsultantMessages'
import ConsultantProducts from './pages/ConsultantProducts'
import B2BNetwork from './pages/B2BNetwork'
import DocumentReadiness from './pages/DocumentReadiness'
import AdminProgressReport from './pages/AdminProgressReport'

const TOAST_OPTS = {
  duration:3500,
  style:{background:'#fff',color:'#111827',borderRadius:'12px',boxShadow:'0 10px 25px -5px rgba(0,0,0,0.1)',fontSize:'14px',fontWeight:'500',border:'1px solid #f3f4f6',padding:'12px 16px'},
  success:{iconTheme:{primary:'#4f46e5',secondary:'#fff'}},
  error:{iconTheme:{primary:'#ef4444',secondary:'#fff'}},
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ActivityPing />
        <Toaster position="top-right" toastOptions={TOAST_OPTS}/>
        <Routes>
          <Route path="/"        element={<Landing />}/>
          <Route path="/login"   element={<Login />}/>
          <Route path="/register"element={<Register />}/>
          {/* Student */}
          <Route path="/dashboard"    element={<ProtectedRoute roles={['user']}><UserDashboard /></ProtectedRoute>}/>
          <Route path="/programs"     element={<ProtectedRoute roles={['user']}><VisaPrograms /></ProtectedRoute>}/>
          <Route path="/eligibility"  element={<ProtectedRoute roles={['user']}><EligibilityAssessment /></ProtectedRoute>}/>
          <Route path="/applications" element={<ProtectedRoute roles={['user']}><Applications /></ProtectedRoute>}/>
          <Route path="/documents"    element={<ProtectedRoute roles={['user']}><Documents /></ProtectedRoute>}/>
          <Route path="/chat"         element={<ProtectedRoute roles={['user']}><StudentChat /></ProtectedRoute>}/>
          <Route path="/marketplace"  element={<ProtectedRoute roles={['user']}><Marketplace /></ProtectedRoute>}/>
          <Route path="/document-readiness" element={<ProtectedRoute roles={['user']}><DocumentReadiness /></ProtectedRoute>}/>
          <Route path="/learning"             element={<ProtectedRoute roles={['user']}><LearningHub /></ProtectedRoute>}/>
          <Route path="/learning/ielts"       element={<ProtectedRoute roles={['user']}><IELTSPrep /></ProtectedRoute>}/>
          <Route path="/learning/interview"   element={<ProtectedRoute roles={['user']}><InterviewPrep /></ProtectedRoute>}/>
          <Route path="/learning/roadmap"     element={<ProtectedRoute roles={['user']}><Roadmap /></ProtectedRoute>}/>
          <Route path="/learning/module/:id"  element={<ProtectedRoute roles={['user']}><ModuleDetail /></ProtectedRoute>}/>
          {/* Admin */}
          <Route path="/admin"           element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>}/>
          <Route path="/admin/users"     element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>}/>
          <Route path="/admin/visa"      element={<ProtectedRoute roles={['admin']}><AdminVisa /></ProtectedRoute>}/>
          <Route path="/admin/documents" element={<ProtectedRoute roles={['admin']}><AdminDocuments /></ProtectedRoute>}/>
          <Route path="/admin/messages"  element={<ProtectedRoute roles={['admin']}><AdminMessages /></ProtectedRoute>}/>
          <Route path="/admin/activity"  element={<ProtectedRoute roles={['admin']}><AdminActivity /></ProtectedRoute>}/>
          <Route path="/admin/progress"  element={<ProtectedRoute roles={['admin']}><AdminProgressReport /></ProtectedRoute>}/>
          {/* Consultant */}
          <Route path="/consultant"              element={<ProtectedRoute roles={['consultant']}><ConsultantDashboard /></ProtectedRoute>}/>
          <Route path="/consultant/b2b"          element={<ProtectedRoute roles={['consultant']}><B2BNetwork /></ProtectedRoute>}/>
          <Route path="/consultant/messages"     element={<ProtectedRoute roles={['consultant']}><ConsultantMessages /></ProtectedRoute>}/>
          <Route path="/consultant/products"     element={<ProtectedRoute roles={['consultant']}><ConsultantProducts /></ProtectedRoute>}/>
          <Route path="*" element={<Navigate to="/" replace />}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
