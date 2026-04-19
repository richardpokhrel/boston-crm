import { useState } from 'react'
import { Send, Trash2, Pin, X } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from './index'
import toast from 'react-hot-toast'

export default function MessageThread({
  messages = [],
  isLoading = false,
  onSendMessage,
  onDeleteMessage,
  onTogglePin,
  currentUserId,
  sendingMessage = false,
}) {
  const [messageText, setMessageText] = useState('')
  const [messageSubject, setMessageSubject] = useState('')
  const [isPriority, setIsPriority] = useState(false)

  const handleSend = () => {
    if (!messageText.trim()) {
      toast.error('Message cannot be empty')
      return
    }

    onSendMessage({
      subject: messageSubject || 'New Message',
      content: messageText,
      priority: isPriority ? 'high' : 'normal',
    })

    setMessageText('')
    setMessageSubject('')
    setIsPriority(false)
  }

  const priorityColors = {
    low: 'bg-blue-50 border-l-4 border-blue-500',
    normal: 'bg-gray-50 border-l-4 border-gray-300',
    high: 'bg-orange-50 border-l-4 border-orange-500',
    urgent: 'bg-red-50 border-l-4 border-red-500',
  }

  const handleDelete = (messageId) => {
    if (window.confirm('Delete this message?')) {
      onDeleteMessage?.(messageId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-96">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-3 rounded-lg ${priorityColors[msg.priority] || priorityColors.normal}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-gray-900">{msg.subject}</h4>
                    {msg.isPinned && <Pin className="w-3 h-3 text-blue-600" />}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {msg.sender?.fullName} • {format(new Date(msg.createdAt), 'MMM dd, HH:mm')}
                  </p>
                </div>
                {currentUserId === msg.sender?._id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => onTogglePin?.(msg._id)}
                      className="text-gray-400 hover:text-blue-600 transition"
                      title={msg.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(msg._id)}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-800 mt-2">{msg.content}</p>

              {msg.attachedDocument && (
                <div className="mt-2 p-2 bg-white rounded border border-gray-300 text-xs">
                  📄 {msg.attachedDocument.title}
                </div>
              )}

              {!msg.isRead && currentUserId !== msg.sender?._id && (
                <p className="text-xs text-blue-600 mt-1">Unread</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="space-y-2 border-t pt-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Subject (Optional)</label>
          <input
            type="text"
            value={messageSubject}
            onChange={(e) => setMessageSubject(e.target.value)}
            placeholder="Message subject..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message here..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPriority}
              onChange={(e) => setIsPriority(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700">Mark as high priority</span>
          </label>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!messageText.trim() || sendingMessage}
            isLoading={sendingMessage}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
