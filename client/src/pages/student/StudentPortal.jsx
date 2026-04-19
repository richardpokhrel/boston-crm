import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
   documentsApi    
} from '../../api/documents'
import { DocumentUploadDialog, DocumentsList } from '../../components/ui'
import toast from 'react-hot-toast'
import { Upload, Download, Trash2, Eye, CheckCircle, AlertCircle } from 'lucide-react'

export function StudentPortal() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Redirect if not student
  useEffect(() => {
    if (user && user.role !== 'student') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Load student's documents
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await documentsApi.getLeadDocuments()
      // Filter only documents uploaded by this student
      const studentDocs = response.documents.filter(
        (doc) => doc.uploadedBy._id === user._id
      )
      setDocuments(studentDocs)
    } catch (error) {
      toast.error('Failed to load documents')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (documentData) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', documentData.file)
      formData.append('documentType', documentData.documentType)
      formData.append('relatedLead', user._id)

      await documentsApi.uploadDocument(formData)
      toast.success('Document uploaded successfully')
      setShowUploadDialog(false)
      loadDocuments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return

    try {
      await documentsApi.deleteDocument(docId)
      toast.success('Document deleted')
      loadDocuments()
    } catch (error) {
      toast.error('Failed to delete document')
      console.error(error)
    }
  }

  const handleDownload = async (docId) => {
    try {
      await documentsApi.downloadDocument(docId)
      toast.success('Download started')
    } catch (error) {
      toast.error('Failed to download document')
      console.error(error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800',
      requested_reupload: 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    )
  }

  const documentStats = {
    total: documents.length,
    approved: documents.filter((d) => d.status === 'approved').length,
    pending: documents.filter((d) => d.status === 'pending').length,
    underReview: documents.filter((d) => d.status === 'under_review').length,
    rejected: documents.filter((d) => d.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-600 mt-1">Manage and upload your documents</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900">{documentStats.total}</p>
              </div>
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600">{documentStats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{documentStats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Under Review</p>
                <p className="text-3xl font-bold text-blue-600">{documentStats.underReview}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{documentStats.rejected}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => setShowUploadDialog(true)}
          className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload Document
        </button>

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
              <p className="text-gray-600 mt-1">Start by uploading your first document</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {doc.documentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {doc.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={doc.fileUrl}
                          className="text-blue-600 hover:text-blue-900"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {doc.fileName}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDownload(doc._id)}
                          className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {doc.status === 'rejected' || doc.status === 'requested_reupload' ? (
                          <button
                            onClick={() => {
                              setSelectedDoc(doc)
                              setShowUploadDialog(true)
                            }}
                            className="text-orange-600 hover:text-orange-900 mr-3 inline-flex items-center"
                            title="Re-upload"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Document Details Modal */}
        {showDetailModal && selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedDoc.documentType}</h3>
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className={`text-sm font-semibold ${getStatusColor(selectedDoc.status)}`}>
                    {selectedDoc.status.replace(/_/g, ' ')}
                  </p>
                </div>
                {selectedDoc.reviewNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Review Notes</p>
                    <p className="text-sm text-gray-800">{selectedDoc.reviewNotes}</p>
                  </div>
                )}
                {selectedDoc.rejectionReason && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejection Reason</p>
                    <p className="text-sm text-gray-800">{selectedDoc.rejectionReason}</p>
                  </div>
                )}
                {selectedDoc.requestReuploadReason && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reupload Reason</p>
                    <p className="text-sm text-gray-800">{selectedDoc.requestReuploadReason}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <DocumentUploadDialog
          onClose={() => {
            setShowUploadDialog(false)
            setSelectedDoc(null)
          }}
          onUpload={handleUpload}
          isLoading={uploading}
        />
      )}
    </div>
  )
}

export default StudentPortal
