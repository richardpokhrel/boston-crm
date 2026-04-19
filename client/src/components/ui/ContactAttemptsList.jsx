import { Bell, Trash2, Edit2 } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from './index'

export default function ContactAttemptsList({ attempts = [], phone, onAddAttempt, maxAttempts = 7 }) {
  const statusColors = {
    contacted: 'bg-blue-100 text-blue-800',
    interested: 'bg-green-100 text-green-800',
    docs_received: 'bg-purple-100 text-purple-800',
    initial_docs_received: 'bg-indigo-100 text-indigo-800',
    new_contacted: 'bg-orange-100 text-orange-800',
  }

  const statusLabels = {
    contacted: 'Contacted',
    interested: 'Interested',
    docs_received: 'Docs Received',
    initial_docs_received: 'Initial Docs',
    new_contacted: 'New Contacted',
  }

  const remainingAttempts = maxAttempts - attempts.length

  return (
    <div className="space-y-4">
      {/* Attempts Counter */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div>
          <p className="text-sm text-gray-600">Contact Attempts</p>
          <p className="text-2xl font-bold text-gray-900">
            {attempts.length} <span className="text-lg text-gray-500">/ {maxAttempts}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Remaining</p>
          <p className={`text-2xl font-bold ${remainingAttempts <= 2 ? 'text-red-600' : 'text-green-600'}`}>
            {remainingAttempts}
          </p>
        </div>
      </div>

      {/* Add New Attempt Button */}
      {remainingAttempts > 0 && (
        <button
          onClick={onAddAttempt}
          className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          Add Contact Attempt
        </button>
      )}

      {/* Attempts List */}
      <div className="space-y-3">
        {attempts.length === 0 ? (
          <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 text-sm">No contact attempts yet</p>
            <p className="text-gray-400 text-xs mt-1">Start tracking by adding your first attempt</p>
          </div>
        ) : (
          attempts
            .slice()
            .reverse()
            .map((attempt, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:border-brand-300 hover:shadow-sm transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-brand-100 text-brand-700 font-semibold rounded-full text-sm">
                      #{attempt.attemptNumber}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{phone}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(attempt.createdAt), 'dd MMM yyyy, HH:mm')}
                      </p>
                    </div>
                  </div>
                  {attempt.notificationFlag && (
                    <Bell className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  )}
                </div>

                {/* Notes */}
                <p className="text-sm text-gray-700 mb-3 p-3 bg-gray-50 rounded border border-gray-100">
                  {attempt.notes}
                </p>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      statusColors[attempt.contactStatus] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabels[attempt.contactStatus] || attempt.contactStatus}
                  </span>
                  {attempt.createdBy && (
                    <p className="text-xs text-gray-500">{attempt.createdBy.fullName}</p>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Full Attempts Message */}
      {remainingAttempts === 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">Maximum attempts reached</p>
          <p className="text-xs text-red-600 mt-1">All 7 contact attempts have been used for this lead</p>
        </div>
      )}
    </div>
  )
}
