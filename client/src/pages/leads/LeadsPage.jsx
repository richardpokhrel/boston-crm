import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Upload, Users as UsersIcon, RefreshCw } from 'lucide-react'
import { useLeads, useDeleteLead } from '../../hooks/useLeads'
import { useAuth } from '../../hooks/useAuth'
import {
  Button, Badge, Spinner, EmptyState, PageHeader, Card, Select,
} from '../../components/ui/index'
import CSVUploadDialog from '../../components/ui/CSVUploadDialog'
import LeadAssignmentDialog from '../../components/ui/LeadAssignmentDialog'

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'docs_received', label: 'Docs Received' },
  { value: 'pre_enrolled', label: 'Pre Enrolled' },
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'lost', label: 'Lost' },
]

const SOURCES = [
  { value: '', label: 'All Sources' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'manual', label: 'Manual' },
]

export default function LeadsPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [filters, setFilters] = useState({ status: '', source: '', search: '', page: 1 })
  const [csvDialogOpen, setCsvDialogOpen] = useState(false)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [selectedLeadIds, setSelectedLeadIds] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  const { data, isLoading, refetch } = useLeads({
    page: filters.page,
    limit: 20,
    ...(filters.status && { status: filters.status }),
    ...(filters.source && { source: filters.source }),
    ...(filters.search && { search: filters.search }),
  })

  const deleteLead = useDeleteLead()

  const leads = data?.data ?? []
  const pagination = data?.pagination

  const set = (key, val) => setFilters((prev) => ({ ...prev, [key]: val, page: 1 }))

  const toggleLeadSelection = (leadId) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    )
    setSelectAll(false)
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedLeadIds([])
    } else {
      setSelectedLeadIds(leads.map((lead) => lead._id))
    }
    setSelectAll(!selectAll)
  }

  const handleCsvSuccess = () => {
    refetch()
    setSelectedLeadIds([])
    setSelectAll(false)
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={pagination ? `${pagination.total} total leads` : ''}
        actions={
          <div className="flex gap-2 flex-wrap">
            {isAdmin && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setCsvDialogOpen(true)}
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </Button>
                {selectedLeadIds.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => setAssignmentDialogOpen(true)}
                  >
                    <RefreshCw className="w-4 h-4" /> Assign ({selectedLeadIds.length})
                  </Button>
                )}
              </>
            )}
            <Button variant="primary" onClick={() => navigate('/leads/new')}>
              <Plus className="w-4 h-4" /> New Lead
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search name, phone, email..."
              value={filters.search}
              onChange={(e) => set('search', e.target.value)}
            />
          </div>
          <Select
            options={STATUSES}
            value={filters.status}
            onChange={(e) => set('status', e.target.value)}
            className="sm:w-44"
          />
          <Select
            options={SOURCES}
            value={filters.source}
            onChange={(e) => set('source', e.target.value)}
            className="sm:w-40"
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No leads found"
            description="Try adjusting your filters or create a new lead"
            action={
              <Button variant="primary" onClick={() => navigate('/leads/new')}>
                <Plus className="w-4 h-4" /> Add Lead
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {isAdmin && (
                    <th className="py-3 px-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                  )}
                  {['Name', 'Phone', 'Program', 'Source', 'Status', 'Counsellor', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selectedLeadIds.includes(lead._id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.includes(lead._id)}
                          onChange={() => toggleLeadSelection(lead._id)}
                          className="rounded"
                        />
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <button
                        className="font-medium text-gray-900 hover:text-brand-600 transition-colors text-left"
                        onClick={() => navigate(`/leads/${lead._id}`)}
                      >
                        {lead.fullName}
                      </button>
                      {lead.isDuplicate && (
                        <span className="ml-2 text-xs text-orange-500">(duplicate)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{lead.phone}</td>
                    <td className="py-3 px-4 text-gray-500">{lead.programInterest || '—'}</td>
                    <td className="py-3 px-4 capitalize text-gray-500">{lead.source}</td>
                    <td className="py-3 px-4">
                      <Badge variant={lead.status} label={lead.status.replace(/_/g, ' ')} />
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {lead.assignedCounsellor?.fullName ?? <span className="text-gray-300">Unassigned</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/leads/${lead._id}`)}
                        >
                          View
                        </Button>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              if (confirm(`Delete lead "${lead.fullName}"?`)) {
                                deleteLead.mutate(lead._id)
                              }
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} — {pagination.total} total
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={!pagination.hasPrev}
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!pagination.hasNext}
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* CSV Upload Dialog */}
      <CSVUploadDialog
        isOpen={csvDialogOpen}
        onClose={() => setCsvDialogOpen(false)}
        onSuccess={handleCsvSuccess}
      />

      {/* Assignment Dialog */}
      <LeadAssignmentDialog
        isOpen={assignmentDialogOpen}
        onClose={() => setAssignmentDialogOpen(false)}
        leadIds={selectedLeadIds}
        onSuccess={handleCsvSuccess}
      />
    </div>
  )
}
