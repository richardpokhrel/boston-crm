import { useState } from 'react'
import { X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { leadsApi } from '../../api/leads'

export default function LeadAssignmentDialog({ isOpen, onClose, onSuccess, leadIds = [] }) {
  const [assignmentStrategy, setAssignmentStrategy] = useState('direct')
  const [selectedCounsellor, setSelectedCounsellor] = useState('')
  const qc = useQueryClient()

  const { data: counsellorsData } = useQuery({
    queryKey: ['counsellors'],
    queryFn: () => leadsApi.getCounsellors().then((r) => r.data.data),
    enabled: isOpen,
  })

  const counsellors = counsellorsData?.counsellors || []

  const bulkAssignMutation = useMutation({
    mutationFn: () =>
      leadsApi.bulkAssign(leadIds, assignmentStrategy, selectedCounsellor),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success(`${leadIds.length} leads assigned successfully`)
      handleClose()
      if (onSuccess) onSuccess()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Assignment failed'),
  })

  const handleAssign = () => {
    if (assignmentStrategy === 'direct' && !selectedCounsellor) {
      toast.error('Please select a counsellor')
      return
    }
    bulkAssignMutation.mutate()
  }

  const handleClose = () => {
    setAssignmentStrategy('direct')
    setSelectedCounsellor('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold">Assign Leads ({leadIds.length})</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={bulkAssignMutation.isPending}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Assignment Strategy */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Assignment Strategy
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="strategy"
                  value="round-robin"
                  checked={assignmentStrategy === 'round-robin'}
                  onChange={(e) => {
                    setAssignmentStrategy(e.target.value)
                    setSelectedCounsellor('')
                  }}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-sm text-gray-900">Round Robin</p>
                  <p className="text-xs text-gray-500">Automatically balanced distribution</p>
                </div>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="strategy"
                  value="direct"
                  checked={assignmentStrategy === 'direct'}
                  onChange={(e) => setAssignmentStrategy(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-sm text-gray-900">Direct Assignment</p>
                  <p className="text-xs text-gray-500">Assign to specific counsellor</p>
                </div>
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

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleClose}
              disabled={bulkAssignMutation.isPending}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 font-medium py-2 rounded transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={bulkAssignMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded transition"
            >
              {bulkAssignMutation.isPending ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
