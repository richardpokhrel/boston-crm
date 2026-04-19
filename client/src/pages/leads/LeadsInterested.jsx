import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, MessageSquare, FileText, Settings } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import { useLead } from '../../hooks/useLeads'
import { useAuth } from '../../hooks/useAuth'
import {
  Button,
  Badge,
  Spinner,
  Card,
  PageHeader,
  DocumentUploadDialog,
  DocumentsList,
  MessageThread,
} from '../../components/ui/index'
import { leadsApi } from '../../api/leads'
import { documentsApi } from '../../api/documents'
import { messagesApi } from '../../api/messages'

const InfoRow = ({ label, value }) => (
  <div className="flex items-start py-2.5 border-b border-gray-50 last:border-0">
    <span className="w-44 text-sm text-gray-500 flex-shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value || '—'}</span>
  </div>
)

export default function LeadsInterested() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const qc = useQueryClient()

  const { data: lead, isLoading: leadLoading, refetch: refetchLead } = useLead(id)
  const [showDocDialog, setShowDocDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('documents')

  // Fetch documents
  const {
    data: documentsData,
    isLoading: docsLoading,
    refetch: refetchDocs,
  } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsApi.getLeadDocuments(id),
    enabled: !!id && lead?.status === 'interested',
  })

  const documents = documentsData?.data?.data?.documents || []
  

  // Fetch messages
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => messagesApi.getLeadMessages(id),
    enabled: !!id && lead?.status === 'interested',
  })

  const messages = messagesData?.data?.messages || []

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: (data) =>
      documentsApi.uploadDocument(
        id,
        data.file,
        data.documentType,
        data.title,
        data.description,
        data.expiryDate
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', id] })
      refetchDocs()
      toast.success('Document uploaded successfully')
      setShowDocDialog(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
  })

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: (docId) => documentsApi.delete(docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', id] })
      refetchDocs()
      toast.success('Document deleted')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data) => messagesApi.sendMessage(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', id] })
      refetchMessages()
      toast.success('Message sent')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send message'),
  })

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (msgId) => messagesApi.delete(msgId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', id] })
      refetchMessages()
      toast.success('Message deleted')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  })

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: (msgId) => messagesApi.togglePin(msgId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', id] })
      refetchMessages()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed'),
  })

  if (leadLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!lead) {
    return <p className="text-gray-500 text-center py-20">Lead not found</p>
  }

  // Role-based permissions
  const isStudent = user?.role === 'student'
  const isCounsellor = user?.role === 'counsellor'
  const canUploadDocs = !isStudent
  const canViewDocs = true
  const canChat = true

  return (
    <div>
      {/* Header */}
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
        subtitle={`Lead ID: ${lead._id} • Status: Interested`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Badge variant="interested" label="Interested" />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-5">
          {/* Student Info Card */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Student Information</h2>
            <InfoRow label="Full Name" value={lead.fullName} />
            <InfoRow label="Email" value={lead.email} />
            <InfoRow label="Phone" value={lead.phone} />
            <InfoRow label="Program Interest" value={lead.programInterest} />
            <InfoRow label="Destination" value={lead.destinationCountry} />
            <InfoRow label="Source" value={lead.source} />
          </Card>

          {/* Tabs Navigation */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'documents'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents
              </div>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'messages'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </div>
            </button>
          </div>

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Documents</h2>
                {canUploadDocs && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowDocDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Button>
                )}
              </div>

              <DocumentsList
                documents={documents}
                isLoading={docsLoading}
                onDelete={(docId) => deleteMutation.mutate(docId)}
                onDownload={(docId) => {
                  window.open(`/api/documents/${docId}/download`)
                }}
                userRole={user?.role}
                canEdit={canUploadDocs}
              />
            </Card>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <Card className="flex flex-col" style={{ minHeight: '500px' }}>
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Messages & Notifications</h2>
              <MessageThread
                messages={messages}
                isLoading={messagesLoading}
                onSendMessage={(data) => sendMessageMutation.mutate(data)}
                onDeleteMessage={(msgId) => deleteMessageMutation.mutate(msgId)}
                onTogglePin={(msgId) => togglePinMutation.mutate(msgId)}
                currentUserId={user?._id}
                sendingMessage={sendMessageMutation.isPending}
              />
            </Card>
          )}

          {/* Upload Dialog */}
          <DocumentUploadDialog
            isOpen={showDocDialog}
            onClose={() => setShowDocDialog(false)}
            onSubmit={(data) => uploadMutation.mutate(data)}
            isLoading={uploadMutation.isPending}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Assignment Info */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Assignment</h2>
            <InfoRow
              label="Counsellor"
              value={lead.assignedCounsellor?.fullName || 'Unassigned'}
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

          {/* Status Info */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h2>
            <InfoRow
              label="Created"
              value={format(new Date(lead.createdAt), 'dd MMM yyyy')}
            />
            <InfoRow
              label="Status Changed"
              value={format(new Date(lead.updatedAt), 'dd MMM yyyy')}
            />
          </Card>

          {/* Document Status Summary */}
          {documents.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Document Status</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">{documents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-medium text-green-600">
                    {documents.filter((d) => d.status === 'approved').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-yellow-600">
                    {documents.filter((d) => d.status === 'under_review').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejected</span>
                  <span className="font-medium text-red-600">
                    {documents.filter((d) => d.status === 'rejected').length}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Unread Messages */}
          {messages.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Messages</h2>
              <p className="text-sm text-gray-600">
                {messages.filter((m) => !m.isRead).length} unread message
                {messages.filter((m) => !m.isRead).length !== 1 ? 's' : ''}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
