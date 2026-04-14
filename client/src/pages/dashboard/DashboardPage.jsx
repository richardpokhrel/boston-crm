import { useQuery } from '@tanstack/react-query'
import { Users, TrendingUp, CheckSquare, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useLeads } from '../../hooks/useLeads'
import { Card, Spinner, Badge, PageHeader } from '../../components/ui/index'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const STAGE_COLORS = {
  new: '#3B82F6', contacted: '#F59E0B', interested: '#F97316',
  docs_received: '#8B5CF6', pre_enrolled: '#14B8A6', enrolled: '#22C55E', lost: '#EF4444',
}

const StatCard = ({ label, value, icon: Icon, color = 'brand' }) => {
  const colors = {
    brand: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: leadsData, isLoading } = useLeads({ limit: 100 })

  const leads = leadsData?.data ?? []

  // Compute funnel stats from lead list
  const stats = leads.reduce(
    (acc, l) => {
      acc.total++
      if (l.status === 'enrolled') acc.enrolled++
      if (l.status === 'lost') acc.lost++
      if (l.slaDueAt && new Date(l.slaDueAt) < new Date() && l.status !== 'enrolled' && l.status !== 'lost')
        acc.slaBreached++
      return acc
    },
    { total: 0, enrolled: 0, lost: 0, slaBreached: 0 }
  )

  // Build funnel chart data
  const statusCounts = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.replace(/_/g, ' '),
    count,
    fill: STAGE_COLORS[status] || '#6B7280',
  }))

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening today"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Leads" value={stats.total} icon={Users} color="brand" />
        <StatCard label="Enrolled" value={stats.enrolled} icon={TrendingUp} color="green" />
        <StatCard label="SLA Breached" value={stats.slaBreached} icon={AlertCircle} color="red" />
        <StatCard label="Lost" value={stats.lost} icon={CheckSquare} color="orange" />
      </div>

      {/* Funnel chart */}
      <Card className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Lead Pipeline</h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={36}>
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val) => [val, 'Leads']}
                labelFormatter={(l) => l.replace(/_/g, ' ')}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Recent leads */}
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Leads</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Name', 'Phone', 'Source', 'Status', 'Counsellor'].map((h) => (
                  <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 8).map((lead) => (
                <tr key={lead._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-gray-900">{lead.fullName}</td>
                  <td className="py-2.5 pr-4 text-gray-500">{lead.phone}</td>
                  <td className="py-2.5 pr-4 capitalize text-gray-500">{lead.source}</td>
                  <td className="py-2.5 pr-4">
                    <Badge variant={lead.status} label={lead.status.replace(/_/g, ' ')} />
                  </td>
                  <td className="py-2.5 text-gray-500">
                    {lead.assignedCounsellor?.fullName ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No leads yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}
