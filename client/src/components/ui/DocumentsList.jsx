import { Download, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from './index'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending_upload: 'bg-blue-100 text-blue-800',
  uploaded: 'bg-gray-100 text-gray-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  requested_reupload: 'bg-orange-100 text-orange-800',
}

const STATUS_ICONS = {
  pending_upload: <Clock className="w-4 h-4" />,
  uploaded: <Clock className="w-4 h-4" />,
  under_review: <Clock className="w-4 h-4" />,
  approved: <CheckCircle className="w-4 h-4" />,
  rejected: <AlertCircle className="w-4 h-4" />,
  requested_reupload: <AlertCircle className="w-4 h-4" />,
}

export default function DocumentsList({
  documents = [],
  isLoading = false,
  onDelete,
  onDownload,
  onStatusChange,
  userRole,
  canEdit = false,
}) {
  const handleDelete = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      onDelete?.(docId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-center mb-3">
          <AlertCircle className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">No documents uploaded yet</p>
        <p className="text-gray-500 text-sm mt-1">Upload your documents to proceed with your application</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc._id}
          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{doc.title}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {doc.documentType?.replace(/_/g, ' ').toUpperCase()} • {doc.fileName}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[doc.status]}`}
            >
              {STATUS_ICONS[doc.status]}
              {doc.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Description */}
          {doc.description && (
            <p className="text-sm text-gray-600 mb-2 p-2 bg-gray-50 rounded">{doc.description}</p>
          )}

          {/* Review Notes */}
          {doc.reviewNotes && (
            <div className="mb-2 p-2 bg-blue-50 border-l-2 border-blue-500 rounded">
              <p className="text-xs font-medium text-blue-700">Reviewer Notes:</p>
              <p className="text-sm text-blue-600">{doc.reviewNotes}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {doc.rejectionReason && (
            <div className="mb-2 p-2 bg-red-50 border-l-2 border-red-500 rounded">
              <p className="text-xs font-medium text-red-700">Rejection Reason:</p>
              <p className="text-sm text-red-600">{doc.rejectionReason}</p>
            </div>
          )}

          {/* Reupload Request */}
          {doc.requestReuploadReason && (
            <div className="mb-2 p-2 bg-orange-50 border-l-2 border-orange-500 rounded">
              <p className="text-xs font-medium text-orange-700">Please Reupload:</p>
              <p className="text-sm text-orange-600">{doc.requestReuploadReason}</p>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="space-x-3">
              <span>Uploaded: {format(new Date(doc.createdAt), 'MMM dd, yyyy')}</span>
              {doc.expiryDate && (
                <span className={new Date(doc.expiryDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                  Expires: {format(new Date(doc.expiryDate), 'MMM dd, yyyy')}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDownload?.(doc._id)}
              className="flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>

            {canEdit && (
              <>
                {doc.status === 'rejected' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onStatusChange?.(doc._id, 'pending_upload')}
                  >
                    Reupload
                  </Button>
                )}

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(doc._id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
