import { useState } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import { leadsApi } from '../../api/leads'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'

export default function CSVUploadDialog({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [assignmentStrategy, setAssignmentStrategy] = useState('round-robin')
  const [selectedCounsellor, setSelectedCounsellor] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  const { data: counsellorsData } = useQuery({
    queryKey: ['counsellors'],
    queryFn: () => leadsApi.getCounsellors().then((r) => r.data.data),
    enabled: isOpen,
  })

  const counsellors = counsellorsData?.counsellors || []

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a CSV file')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    if (assignmentStrategy === 'direct' && !selectedCounsellor) {
      toast.error('Please select a counsellor for direct assignment')
      return
    }

    setIsLoading(true)
    try {
      const response = await leadsApi.importCsv(
        file,
        assignmentStrategy,
        selectedCounsellor,
      )
      
      setUploadResult(response.data.data)
      toast.success(`Successfully imported ${response.data.data.imported} leads`)
      
      if (onSuccess) onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setAssignmentStrategy('round-robin')
    setSelectedCounsellor('')
    setUploadResult(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold">Import Leads from CSV</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {uploadResult ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-green-800 font-medium">Import Complete</p>
                <p className="text-sm text-green-700 mt-1">
                  {uploadResult.summary.imported} of {uploadResult.summary.total} leads imported
                </p>
              </div>

              {uploadResult.duplicates.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-yellow-800 font-medium text-sm">
                    {uploadResult.duplicates.length} Duplicates Found
                  </p>
                  <div className="text-xs text-yellow-700 mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {uploadResult.duplicates.map((dup, i) => (
                      <p key={i}>{dup.fullName} ({dup.phone})</p>
                    ))}
                  </div>
                </div>
              )}

              {uploadResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-800 font-medium text-sm">
                    {uploadResult.errors.length} Errors
                  </p>
                  <div className="text-xs text-red-700 mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {uploadResult.errors.map((err, i) => (
                      <p key={i}>Row {err.row}: {err.error}</p>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* CSV Template Info */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <p className="text-blue-800 font-medium mb-2">CSV Format Required:</p>
                <code className="text-blue-700 text-xs">
                  fullName,phone,email,programInterest,destinationCountry
                </code>
              </div>

              {/* File Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select CSV File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
                  onClick={() => document.getElementById('csvInput').click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {file?.name || 'Click to select a CSV file'}
                  </p>
                </div>
                <input
                  id="csvInput"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Assignment Strategy */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Assignment Strategy
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="strategy"
                      value="round-robin"
                      checked={assignmentStrategy === 'round-robin'}
                      onChange={(e) => {
                        setAssignmentStrategy(e.target.value)
                        setSelectedCounsellor('')
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Round Robin (Balanced Distribution)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="strategy"
                      value="direct"
                      checked={assignmentStrategy === 'direct'}
                      onChange={(e) => setAssignmentStrategy(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Direct Assignment</span>
                  </label>
                </div>
              </div>

              {/* Counsellor Selection */}
              {assignmentStrategy === 'direct' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Counsellor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCounsellor}
                    onChange={(e) => setSelectedCounsellor(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a counsellor...</option>
                    {counsellors.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 rounded transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!file || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 rounded transition"
                >
                  {isLoading ? 'Uploading...' : 'Import'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
