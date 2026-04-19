import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ui/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

// Pages
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import LeadsPage from './pages/leads/LeadsPage'
import LeadDetailPage from './pages/leads/LeadDetailPage'
import LeadsInterested from './pages/leads/LeadsInterested'
import CreateLeadPage from './pages/leads/CreateLeadPage'
import StudentPortal from './pages/student/StudentPortal'
import AdminDocumentReview from './pages/admin/AdminDocumentReview'

// Placeholder pages — swap with real implementations
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      <p className="text-sm text-gray-400 mt-1">Coming soon</p>
    </div>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Student Portal */}
        <Route element={<ProtectedRoute />}>
          <Route path="/student/portal" element={<StudentPortal />} />
        </Route>

        {/* Admin Document Review */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/documents" element={<AdminDocumentReview />} />
        </Route>

        {/* Protected — all staff */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/new" element={<CreateLeadPage />} />
            <Route path="/leads/:id/interested" element={<LeadsInterested />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
            <Route path="/tasks" element={<Placeholder title="Tasks" />} />
            <Route path="/reports" element={<Placeholder title="Reports" />} />
            <Route path="/users" element={<Placeholder title="User Management" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
