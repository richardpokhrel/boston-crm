import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCircle, CheckSquare,
  Bell, BarChart2, Settings, LogOut, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, roles: ['admin','counsellor','docs_team','app_team'] },
  { to: '/leads',       label: 'Leads',        icon: Users,          roles: ['admin','counsellor','app_team'] },
  { to: '/tasks',       label: 'Tasks',        icon: CheckSquare,    roles: ['admin','counsellor','docs_team','app_team'] },
  { to: '/users',       label: 'Users',        icon: UserCircle,     roles: ['admin'] },
  { to: '/reports',     label: 'Reports',      icon: BarChart2,      roles: ['admin','counsellor'] },
  { to: '/settings',    label: 'Settings',     icon: Settings,       roles: ['admin'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const allowed = navItems.filter((item) => item.roles.includes(user?.role))

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-60 bg-brand-900 flex flex-col transition-transform duration-200',
          'md:translate-x-0 md:static md:flex',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <span className="text-xl font-bold text-white">Boston CRM</span>
          <p className="text-xs text-white/50 mt-0.5">Education Management</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allowed.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-white/50 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
