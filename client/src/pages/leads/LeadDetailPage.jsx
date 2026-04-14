import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Settings } from 'lucide-react'
import { useLead, useUpdateLeadStatus } from '../../hooks/useLeads'
import { useAuth } from '../../hooks/useAuth'
import { Button, Badge, Spinner, Card, PageHeader, Select } from '../../components/ui/index'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { leadsApi } from '../../api/leads'
import { format } from 'date-fns'

const NEXT_STATUSES = {
  new: ['contacted', 'lost'],
  contacted: ['interested', 'lost'],
  interested: ['docs_received', 'lost'],
  docs_received: ['initial_docs_completed', 'lost'],
  initial_docs_completed: ['pre_conditional', 'lost'],
  pre_conditional: ['pre_enrolled', 'lost'],
  pre_enrolled: ['enrolled', 'lost'],
  enrolled: [],
  lost: [],
}

const ALL_STATUSES = [
  'new',
  'contacted',
  'interested',
  'docs_received',
  'initial_docs_completed',
  'pre_conditional',
  'pre_enrolled',
  'enrolled',
  'lost',
]

const InfoRow = ({ label, value }) => (
  <div className="flex items-start py-2.5 border-b border-gray-50 last:border-0">
    <span className="w-44 text-sm text-gray-500 flex-shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value || '—'}</span>
  </div>
)

export default function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { data: lead, isLoading, refetch } = useLead(id)
  const updateStatus = useUpdateLeadStatus()
  const qc = useQueryClient()

  const [newStatus, setNewStatus] = useState('')
  const [lostReason, setLostReason] = useState('')
  const [showStatusForm, setShowStatusForm] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [selectedCounsellor, setSelectedCounsellor] = useState('')

  const { data: counsellorsData } = useQuery({
    queryKey: ['counsellors'],
    queryFn: () => leadsApi.getCounsellors().then((r) => r.data.data),
    enabled: isAdmin && showAdminPanel,
  })

  const counsellors = counsellorsData?.counsellors || []

  const adminUpdateStatusMutation = useMutation({
    mutationFn: () =>
      leadsApi.adminUpdateLeadStatus(id, {
        status: newStatus,
        reason: lostReason,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead', id] })
      refetch()
      toast.success('Lead status updated')
      setShowStatusForm(false)
      setNewStatus('')
      setLostReason('')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  })

  const adminReassignMutation = useMutation({
    mutationFn: () => leadsApi.adminReassignLead(id, selectedCounsellor),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead', id] })
      refetch()
      toast.success('Lead reassigned')
      setSelectedCounsellor('')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Reassign failed'),
  })

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )

  if (!lead)
    return <p className="text-gray-500 text-center py-20">Lead not found</p>

  const availableStatuses = NEXT_STATUSES[lead.status] ?? []

  const handleStatusUpdate = () => {
    if (!newStatus) return
    if (isAdmin) {
      adminUpdateStatusMutation.mutate()
    } else {
      updateStatus.mutate(
        { id, data: { status: newStatus, reason: lostReason } },
        {
          onSuccess: () => {
            setShowStatusForm(false)
            setNewStatus('')
            setLostReason('')
          },
        }
      )
    }
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate('/leads')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </button>
      </div>

      <PageHeader
        title={lead.fullName}
        subtitle={`Lead ID: ${lead._id}`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Badge variant={lead.status} label={lead.status.replace(/_/g, ' ')} />
            {isAdmin && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAdminPanel(!showAdminPanel)}
              >
                <Settings className="w-3.5 h-3.5" /> Admin
              </Button>
            )}
            {(availableStatuses.length > 0 || isAdmin) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowStatusForm(!showStatusForm)}
              >
                <Edit2 className="w-3.5 h-3.5" /> {isAdmin ? 'Override Status' : 'Update Status'}
              </Button>
            )}
          </div>
        }
      />

      {/* Admin Panel */}
      {showAdminPanel && isAdmin && (
        <Card className="mb-5 border-purple-200 bg-purple-50">
          <h3 className="text-sm font-semibold text-purple-700 mb-4">Admin Controls</h3>
          <div className="space-y-4">
            {/* Reassign Lead */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reassign to Counsellor
              </label>
              <div className="flex gap-2">
                <Select
                  options={[
                    { value: '', label: 'Select counsellor...' },
                    ...counsellors.map((c) => ({ value: c._id, label: c.fullName })),
                  ]}
                  value={selectedCounsellor}
                  onChange={(e) => setSelectedCounsellor(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => adminReassignMutation.mutate()}
                  disabled={!selectedCounsellor || adminReassignMutation.isPending}
                >
                  {adminReassignMutation.isPending ? 'Reassigning...' : 'Reassign'}
                </Button>
              </div>
            </div>

            <div className="border-t border-purple-200 pt-4">
              <p className="text-xs text-purple-600 mb-2">
                ✓ Can override any lead status or pipeline stage
              </p>
              <p className="text-xs text-purple-600">
                ✓ Can reassign lead to any counsellor
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Status update form */}
      {showStatusForm && (availableStatuses.length > 0 || isAdmin) && (
        <Card className="mb-5 border-brand-200 bg-brand-50">
          <h3 className="text-sm font-semibold text-brand-700 mb-3">
            {isAdmin ? 'Override Lead Status' : 'Move to next stage'}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              options={[
                { value: '', label: 'Select status...' },
                ...(isAdmin
                  ? ALL_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))
                  : availableStatuses.map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))
                ),
              ]}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="sm:w-56"
            />
            {newStatus === 'lost' && (
              <input
                className="input flex-1"
                placeholder="Reason for losing (required)"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
              />
            )}
            <Button
              variant="primary"
              onClick={handleStatusUpdate}
              isLoading={updateStatus.isPending || adminUpdateStatusMutation.isPending}
              disabled={!newStatus || (newStatus === 'lost' && !lostReason)}
            >
              Confirm
            </Button>
            <Button variant="secondary" onClick={() => setShowStatusForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h2>
            <InfoRow label="Full Name" value={lead.fullName} />
            <InfoRow label="Email" value={lead.email} />
            <InfoRow label="Phone" value={lead.phone} />
            <InfoRow label="Program Interest" value={lead.programInterest} />
            <InfoRow label="Destination" value={lead.destinationCountry} />
            <InfoRow label="Source" value={lead.source} />
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Qualification Notes</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {lead.qualificationNotes || 'No notes recorded yet.'}
            </p>
          </Card>

          {lead.status === 'lost' && (
            <Card className="border-red-200 bg-red-50">
              <h2 className="text-sm font-semibold text-red-700 mb-3">Lost Reason</h2>
              <p className="text-sm text-red-600">{lead.lostReason}</p>
              {lead.lostReasonCategory && (
                <Badge variant={lead.lostReasonCategory} label={lead.lostReasonCategory} />
              )}
            </Card>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-5">
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Assignment</h2>
            <InfoRow
              label="Counsellor"
              value={lead.assignedCounsellor?.fullName}
            />
            <InfoRow
              label="Attempt Count"
              value={
                <span className={lead.attemptCount >= 5 ? 'text-red-600 font-bold' : ''}>
                  {lead.attemptCount} / 7
                </span>
              }
            />
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h2>
            <InfoRow
              label="Created"
              value={format(new Date(lead.createdAt), 'dd MMM yyyy HH:mm')}
            />
            <InfoRow
              label="Updated"
              value={format(new Date(lead.updatedAt), 'dd MMM yyyy HH:mm')}
            />
            {lead.enrolledAt && (
              <InfoRow
                label="Enrolled"
                value={format(new Date(lead.enrolledAt), 'dd MMM yyyy')}
              />
            )}
            {lead.slaDueAt && (
              <InfoRow
                label="SLA Due"
                value={
                  <span
                    className={new Date(lead.slaDueAt) < new Date() ? 'text-red-600 font-bold' : 'text-gray-900'}
                  >
                    {format(new Date(lead.slaDueAt), 'dd MMM yyyy HH:mm')}
                  </span>
                }
              />
            )}
          </Card>
          
        </div>
      </div>
    </div>
  )
}
