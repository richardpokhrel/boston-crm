import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Settings, Upload, MessageSquare, FileText, Phone } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import { useLead, useUpdateLeadStatus } from '../../hooks/useLeads'
import { useAuth } from '../../hooks/useAuth'
import {
  Button, Badge, Spinner, Card, PageHeader, Select,
  ContactAttemptDialog, ContactAttemptsList,
  DocumentUploadDialog, DocumentsList,
  MessageThread,
} from '../../components/ui/index'
import { leadsApi } from '../../api/leads'
import { documentsApi } from '../../api/documents'
import { messagesApi } from '../../api/messages'

// ─── Pipeline config ────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { key: 'new',                   label: 'New' },
  { key: 'contacted',             label: 'Contacted' },
  { key: 'interested',            label: 'Interested' },
  { key: 'docs_received',         label: 'Docs received' },
  { key: 'initial_docs_completed',label: 'Initial docs' },
  { key: 'pre_conditional',       label: 'Pre-conditional' },
  { key: 'pre_enrolled',          label: 'Pre-enrolled' },
  { key: 'enrolled',              label: 'Enrolled' },
]

const NEXT_STATUSES = {
  new:                    ['contacted', 'lost'],
  contacted:              ['interested', 'lost'],
  interested:             ['docs_received', 'lost'],
  docs_received:          ['initial_docs_completed', 'lost'],
  initial_docs_completed: ['pre_conditional', 'lost'],
  pre_conditional:        ['pre_enrolled', 'lost'],
  pre_enrolled:           ['enrolled', 'lost'],
  enrolled:               [],
  lost:                   [],
}

const ALL_STATUSES = [
  'new','contacted','interested','docs_received',
  'initial_docs_completed','pre_conditional','pre_enrolled','enrolled','lost',
]

// ─── Status-specific guidance shown below the timeline ──────────────────────

const STATUS_HINTS = {
  new:                    'New lead — assign to a counsellor and make first contact.',
  contacted:              'Record every call or WhatsApp attempt. Move to "Interested" once the student confirms interest.',
  interested:             'Student is interested — collect and review their documents, communicate via Messages.',
  docs_received:          'Documents received — review each document and request any missing ones.',
  initial_docs_completed: 'Initial documents are complete — prepare the conditional offer.',
  pre_conditional:        'Conditional offer issued — follow up until all conditions are met.',
  pre_enrolled:           'Pre-enrolled — finalise enrolment paperwork.',
  enrolled:               'Student is enrolled.',
  lost:                   'This lead has been marked as lost.',
}

// Tabs available per stage
const tabsForStatus = (status) => {
  const base = ['overview', 'contact']
  const docStages = ['interested','docs_received','initial_docs_completed','pre_conditional','pre_enrolled','enrolled']
  if (docStages.includes(status)) return [...base, 'documents', 'messages']
  return base
}

// ─── Small helpers ───────────────────────────────────────────────────────────

const InfoRow = ({ label, value }) => (
  <div className="flex items-start py-2.5 border-b border-gray-50 last:border-0">
    <span className="w-44 text-sm text-gray-500 flex-shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value || '—'}</span>
  </div>
)

const TAB_LABELS = {
  overview:  { icon: null,            label: 'Overview' },
  contact:   { icon: Phone,           label: 'Contact attempts' },
  documents: { icon: FileText,        label: 'Documents' },
  messages:  { icon: MessageSquare,   label: 'Messages' },
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function StatusTimeline({ currentStatus }) {
  const isLost = currentStatus === 'lost'
  const currentIdx = PIPELINE_STAGES.findIndex(s => s.key === currentStatus)

  return (
    <Card className="mb-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        Pipeline progress
      </p>

      {isLost ? (
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-medium">✕</div>
          <span className="text-sm font-medium text-red-600">Lead lost</span>
        </div>
      ) : (
        <div className="flex items-center overflow-x-auto pb-1 gap-0">
          {PIPELINE_STAGES.map((stage, idx) => {
            const done   = idx < currentIdx
            const active = idx === currentIdx
            return (
              <div key={stage.key} className="flex items-center flex-1 min-w-0">
                {/* Node */}
                <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
                  <div className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 flex-shrink-0
                    ${done   ? 'bg-teal-600 border-teal-600 text-white'                               : ''}
                    ${active ? 'bg-blue-600 border-blue-600 text-white'                               : ''}
                    ${!done && !active ? 'bg-gray-50 border-gray-200 text-gray-400'                   : ''}
                  `}>
                    {done ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[10px] text-center leading-tight whitespace-nowrap
                    ${done   ? 'text-teal-600'                   : ''}
                    ${active ? 'text-blue-600 font-semibold'     : ''}
                    ${!done && !active ? 'text-gray-400'         : ''}
                  `}>
                    {stage.label}
                  </span>
                </div>
                {/* Connector */}
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 -mt-4 ${done ? 'bg-teal-500' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user, isAdmin } = useAuth()
  const qc        = useQueryClient()

  const { data: lead, isLoading, refetch } = useLead(id)
  const updateStatus = useUpdateLeadStatus()

  // UI state
  const [activeTab,          setActiveTab]          = useState('overview')
  const [showStatusForm,     setShowStatusForm]     = useState(false)
  const [showAdminPanel,     setShowAdminPanel]     = useState(false)
  const [newStatus,          setNewStatus]          = useState('')
  const [lostReason,         setLostReason]         = useState('')
  const [selectedCounsellor, setSelectedCounsellor] = useState('')
  const [showContactDialog,  setShowContactDialog]  = useState(false)
  const [showDocDialog,      setShowDocDialog]      = useState(false)

  // Make sure active tab is valid when status changes
  useEffect(() => {
    if (lead && !tabsForStatus(lead.status).includes(activeTab)) {
      setActiveTab('overview')
    }
  }, [lead?.status])

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: counsellorsData } = useQuery({
    queryKey: ['counsellors'],
    queryFn:  () => leadsApi.getCounsellors().then(r => r.data.data),
    enabled:  isAdmin && showAdminPanel,
  })
  const counsellors = counsellorsData?.counsellors || []

  const docStages = ['interested','docs_received','initial_docs_completed','pre_conditional','pre_enrolled','enrolled']
  const docsEnabled = !!lead && docStages.includes(lead.status)

  const { data: documentsData, isLoading: docsLoading, refetch: refetchDocs } = useQuery({
    queryKey: ['documents', id],
    queryFn:  () => documentsApi.getLeadDocuments(id),
    enabled:  !!id && docsEnabled,
  })
  const documents = documentsData?.data?.data?.documents || []

  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', id],
    queryFn:  () => messagesApi.getLeadMessages(id),
    enabled:  !!id && docsEnabled,
  })
  const messages = messagesData?.data?.messages || []

  // ── Mutations ────────────────────────────────────────────────────────────

  const adminUpdateStatusMutation = useMutation({
    mutationFn: () => leadsApi.adminUpdateLeadStatus(id, { status: newStatus, reason: lostReason }),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['lead', id] })
      refetch()
      toast.success('Status updated')
      setShowStatusForm(false); setNewStatus(''); setLostReason('')
    },
    onError: err => toast.error(err.response?.data?.message || 'Update failed'),
  })

  const adminReassignMutation = useMutation({
    mutationFn: () => leadsApi.adminReassignLead(id, selectedCounsellor),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['lead', id] })
      refetch()
      toast.success('Lead reassigned')
      setSelectedCounsellor('')
    },
    onError: err => toast.error(err.response?.data?.message || 'Reassign failed'),
  })

  const addContactAttemptMutation = useMutation({
    mutationFn: data => leadsApi.addContactAttempt(id, data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['lead', id] })
      refetch()
      toast.success('Contact attempt recorded')
      setShowContactDialog(false)
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  })

  const uploadMutation = useMutation({
    mutationFn: data => documentsApi.uploadDocument(id, data.file, data.documentType, data.title, data.description, data.expiryDate),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['documents', id] })
      refetchDocs()
      toast.success('Document uploaded')
      setShowDocDialog(false)
    },
    onError: err => toast.error(err.response?.data?.message || 'Upload failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: docId => documentsApi.delete(docId),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['documents', id] }); refetchDocs(); toast.success('Document deleted') },
    onError:    err => toast.error(err.response?.data?.message || 'Delete failed'),
  })

  const sendMessageMutation = useMutation({
    mutationFn: data => messagesApi.sendMessage(id, data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['messages', id] }); refetchMessages(); toast.success('Message sent') },
    onError:    err => toast.error(err.response?.data?.message || 'Failed'),
  })

  const deleteMessageMutation = useMutation({
    mutationFn: msgId => messagesApi.delete(msgId),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['messages', id] }); refetchMessages(); toast.success('Deleted') },
    onError:    err => toast.error(err.response?.data?.message || 'Failed'),
  })

  const togglePinMutation = useMutation({
    mutationFn: msgId => messagesApi.togglePin(msgId),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['messages', id] }); refetchMessages() },
    onError:    err => toast.error(err.response?.data?.message || 'Failed'),
  })

  // ── Guards ───────────────────────────────────────────────────────────────

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!lead)     return <p className="text-gray-500 text-center py-20">Lead not found</p>

  // ── Derived values ───────────────────────────────────────────────────────

  const availableStatuses = NEXT_STATUSES[lead.status] ?? []
  const visibleTabs = tabsForStatus(lead.status)

  const handleStatusUpdate = () => {
    if (!newStatus) return
    if (isAdmin) {
      adminUpdateStatusMutation.mutate()
    } else {
      updateStatus.mutate(
        { id, data: { status: newStatus, reason: lostReason } },
        { onSuccess: () => { setShowStatusForm(false); setNewStatus(''); setLostReason('') } }
      )
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Back nav */}
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
              <Button variant="secondary" size="sm" onClick={() => setShowAdminPanel(!showAdminPanel)}>
                <Settings className="w-3.5 h-3.5" /> Admin
              </Button>
            )}
            {(availableStatuses.length > 0 || isAdmin) && (
              <Button variant="primary" size="sm" onClick={() => setShowStatusForm(!showStatusForm)}>
                <Edit2 className="w-3.5 h-3.5" /> {isAdmin ? 'Override status' : 'Update status'}
              </Button>
            )}
          </div>
        }
      />

      {/* ── Pipeline timeline ─────────────────────────────────────────── */}
      <StatusTimeline currentStatus={lead.status} />

      {/* ── Status-specific hint ──────────────────────────────────────── */}
      {STATUS_HINTS[lead.status] && (
        <div className="mb-5 flex items-start gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
          <span className="mt-0.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          {STATUS_HINTS[lead.status]}
        </div>
      )}

      {/* ── Admin panel ───────────────────────────────────────────────── */}
      {showAdminPanel && isAdmin && (
        <Card className="mb-5 border-purple-200 bg-purple-50">
          <h3 className="text-sm font-semibold text-purple-700 mb-4">Admin controls</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reassign to counsellor</label>
              <div className="flex gap-2">
                <Select
                  options={[
                    { value: '', label: 'Select counsellor...' },
                    ...counsellors.map(c => ({ value: c._id, label: c.fullName })),
                  ]}
                  value={selectedCounsellor}
                  onChange={e => setSelectedCounsellor(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm" variant="secondary"
                  onClick={() => adminReassignMutation.mutate()}
                  disabled={!selectedCounsellor || adminReassignMutation.isPending}
                >
                  {adminReassignMutation.isPending ? 'Reassigning…' : 'Reassign'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Status update form ────────────────────────────────────────── */}
      {showStatusForm && (availableStatuses.length > 0 || isAdmin) && (
        <Card className="mb-5 border-brand-200 bg-brand-50">
          <h3 className="text-sm font-semibold text-brand-700 mb-3">
            {isAdmin ? 'Override lead status' : 'Move to next stage'}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              options={[
                { value: '', label: 'Select status…' },
                ...(isAdmin
                  ? ALL_STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ') }))
                  : availableStatuses.map(s => ({ value: s, label: s.replace(/_/g, ' ') }))
                ),
              ]}
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className="sm:w-56"
            />
            {newStatus === 'lost' && (
              <input
                className="input flex-1"
                placeholder="Reason for losing (required)"
                value={lostReason}
                onChange={e => setLostReason(e.target.value)}
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
            <Button variant="secondary" onClick={() => setShowStatusForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* ── Tab bar ───────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 mb-5 gap-0">
        {visibleTabs.map(tab => {
          const { icon: Icon, label } = TAB_LABELS[tab]
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────── */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Contact information</h2>
              <InfoRow label="Full name"       value={lead.fullName} />
              <InfoRow label="Email"           value={lead.email} />
              <InfoRow label="Phone"           value={lead.phone} />
              <InfoRow label="Program interest"value={lead.programInterest} />
              <InfoRow label="Destination"     value={lead.destinationCountry} />
              <InfoRow label="Source"          value={lead.source} />
            </Card>

            {lead.status === 'lost' && (
              <Card className="border-red-200 bg-red-50">
                <h2 className="text-sm font-semibold text-red-700 mb-3">Lost reason</h2>
                <p className="text-sm text-red-600">{lead.lostReason}</p>
                {lead.lostReasonCategory && (
                  <Badge variant={lead.lostReasonCategory} label={lead.lostReasonCategory} className="mt-2" />
                )}
              </Card>
            )}
          </div>

          <div className="space-y-5">
            <Card>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Assignment</h2>
              <InfoRow label="Counsellor"    value={lead.assignedCounsellor?.fullName} />
              <InfoRow label="Attempt count" value={
                <span className={lead.attemptCount >= 5 ? 'text-red-600 font-bold' : ''}>
                  {lead.attemptCount} / 7
                </span>
              } />
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h2>
              <InfoRow label="Created"  value={format(new Date(lead.createdAt), 'dd MMM yyyy HH:mm')} />
              <InfoRow label="Updated"  value={format(new Date(lead.updatedAt), 'dd MMM yyyy HH:mm')} />
              {lead.enrolledAt && (
                <InfoRow label="Enrolled" value={format(new Date(lead.enrolledAt), 'dd MMM yyyy')} />
              )}
              {lead.slaDueAt && (
                <InfoRow label="SLA due" value={
                  <span className={new Date(lead.slaDueAt) < new Date() ? 'text-red-600 font-bold' : ''}>
                    {format(new Date(lead.slaDueAt), 'dd MMM yyyy HH:mm')}
                  </span>
                } />
              )}
            </Card>
          </div>
        </div>
      )}

      {/* CONTACT ATTEMPTS TAB */}
      {activeTab === 'contact' && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Contact attempts & notes</h2>
          <ContactAttemptsList
            attempts={lead.contactAttempts || []}
            phone={lead.phone}
            onAddAttempt={() => setShowContactDialog(true)}
            maxAttempts={7}
          />
        </Card>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Documents</h2>
            {user?.role !== 'student' && (
              <Button variant="primary" size="sm" onClick={() => setShowDocDialog(true)}>
                <Upload className="w-4 h-4" /> Upload document
              </Button>
            )}
          </div>

          <DocumentsList
            documents={documents}
            isLoading={docsLoading}
            onDelete={docId => deleteMutation.mutate(docId)}
            onDownload={docId => window.open(`/api/documents/${docId}/download`)}
            userRole={user?.role}
            canEdit={user?.role !== 'student'}
          />

          {/* Sidebar summary inline */}
          {documents.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100 flex gap-6 text-sm">
              {[
                { label: 'Total',    val: documents.length,                                              cls: 'text-gray-700' },
                { label: 'Approved', val: documents.filter(d => d.status === 'approved').length,         cls: 'text-green-600' },
                { label: 'Pending',  val: documents.filter(d => d.status === 'under_review').length,     cls: 'text-yellow-600' },
                { label: 'Rejected', val: documents.filter(d => d.status === 'rejected').length,         cls: 'text-red-600' },
              ].map(({ label, val, cls }) => (
                <div key={label} className="text-center">
                  <p className={`text-lg font-semibold ${cls}`}>{val}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* MESSAGES TAB */}
      {activeTab === 'messages' && (
        <Card style={{ minHeight: '500px' }}>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Messages & notifications</h2>
          <MessageThread
            messages={messages}
            isLoading={messagesLoading}
            onSendMessage={data => sendMessageMutation.mutate(data)}
            onDeleteMessage={msgId => deleteMessageMutation.mutate(msgId)}
            onTogglePin={msgId => togglePinMutation.mutate(msgId)}
            currentUserId={user?._id}
            sendingMessage={sendMessageMutation.isPending}
          />
        </Card>
      )}

      {/* ── Dialogs ───────────────────────────────────────────────────── */}
      <ContactAttemptDialog
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        onSubmit={data => addContactAttemptMutation.mutate(data)}
        isLoading={addContactAttemptMutation.isPending}
        phone={lead.phone}
        attemptNumber={(lead.contactAttempts?.length || 0) + 1}
      />

      <DocumentUploadDialog
        isOpen={showDocDialog}
        onClose={() => setShowDocDialog(false)}
        onSubmit={data => uploadMutation.mutate(data)}
        isLoading={uploadMutation.isPending}
      />
    </div>
  )
}