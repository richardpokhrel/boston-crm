import { useState } from 'react'
import { X, Bell, Send } from 'lucide-react'
import { Button, Input } from './index'

export default function ContactAttemptDialog({ isOpen, onClose, onSubmit, isLoading, phone, attemptNumber }) {
  const [notes, setNotes] = useState('')
  const [contactStatus, setContactStatus] = useState('contacted')
  const [notificationFlag, setNotificationFlag] = useState(false)

  const handleSubmit = () => {
    if (!notes.trim()) {
      alert('Please enter notes')
      return
    }
    onSubmit({
      notes,
      contactStatus,
      notificationFlag,
    })
    setNotes('')
    setContactStatus('contacted')
    setNotificationFlag(false)
  }

  const handleClose = () => {
    setNotes('')
    setContactStatus('contacted')
    setNotificationFlag(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Contact Attempt #{attemptNumber}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Phone Display */}
          <div className="text-center pb-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">Contact Number</p>
            <p className="text-lg font-semibold text-gray-900">{phone}</p>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes about this contact attempt..."
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            />
          </div>

          {/* Contact Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Status
            </label>
            <select
              value={contactStatus}
              onChange={(e) => setContactStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="docs_received">Docs Received</option>
              <option value="initial_docs_received">Initial Docs Received</option>
              <option value="new_contacted">New Contacted</option>
            </select>
          </div>

          {/* Notification Flag */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="notification"
              checked={notificationFlag}
              onChange={(e) => setNotificationFlag(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="notification" className="flex items-center gap-2 cursor-pointer flex-1">
              <Bell className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Flag for Follow-up</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!notes.trim() || isLoading}
            isLoading={isLoading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}
