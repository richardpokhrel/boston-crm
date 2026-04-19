import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'
import { forwardRef } from 'react'
export { default as ContactAttemptDialog } from './ContactAttemptDialog'
export { default as ContactAttemptsList } from './ContactAttemptsList'
export { default as DocumentUploadDialog } from './DocumentUploadDialog'
export { default as DocumentsList } from './DocumentsList'
export { default as MessageThread } from './MessageThread'

// ── Button ────────────────────────────────────────────────────────────────
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn text-gray-600 hover:bg-gray-100',
  }
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  }

  return (
    <button
      className={clsx(variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────
export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <input ref={ref} className={clsx('input', error && 'border-red-400 focus:ring-red-400', className)} {...props} />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
))
Input.displayName = 'Input'

// ── Select ────────────────────────────────────────────────────────────────
export const Select = forwardRef(({ label, error, options = [], className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <select ref={ref} className={clsx('input bg-white', error && 'border-red-400', className)} {...props}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
))
Select.displayName = 'Select'

// ── Badge ─────────────────────────────────────────────────────────────────
const badgeColors = {
  new:                    'bg-blue-100 text-blue-800',
  contacted:              'bg-yellow-100 text-yellow-800',
  interested:             'bg-orange-100 text-orange-800',
  docs_received:          'bg-purple-100 text-purple-800',
  initial_docs_completed: 'bg-indigo-100 text-indigo-800',
  pre_conditional:        'bg-cyan-100 text-cyan-800',
  pre_enrolled:           'bg-teal-100 text-teal-800',
  enrolled:               'bg-green-100 text-green-800',
  lost:                   'bg-red-100 text-red-800',
  critical:               'bg-red-100 text-red-700',
  high:                   'bg-orange-100 text-orange-700',
  medium:                 'bg-yellow-100 text-yellow-700',
  low:                    'bg-gray-100 text-gray-700',
  open:                   'bg-blue-100 text-blue-700',
  completed:              'bg-green-100 text-green-700',
  overdue:                'bg-red-100 text-red-700',
  admin:                  'bg-purple-100 text-purple-800',
  counsellor:             'bg-blue-100 text-blue-800',
  docs_team:              'bg-teal-100 text-teal-800',
  app_team:               'bg-indigo-100 text-indigo-800',
}

export const Badge = ({ label, variant }) => (
  <span className={clsx('badge', badgeColors[variant] || 'bg-gray-100 text-gray-700')}>
    {label || variant}
  </span>
)

// ── Spinner ───────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <Loader2 className={clsx('animate-spin text-brand-600', sizes[size], className)} />
  )
}

// ── Card ──────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', padding = true }) => (
  <div className={clsx('card', padding && 'p-5', className)}>{children}</div>
)

// ── Empty state ───────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && <Icon className="w-12 h-12 text-gray-300 mb-4" />}
    <h3 className="text-base font-semibold text-gray-700">{title}</h3>
    {description && <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

// ── Page header ───────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex gap-2">{actions}</div>}
  </div>
)
