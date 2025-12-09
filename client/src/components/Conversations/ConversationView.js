import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import API_BASE, { getAuthHeaders } from '../../config/api';

const ConversationView = ({ user }) => {
  const { id } = useParams();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchConversation();
  }, [id]);

  const fetchConversation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/conversations/${id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setConversation(data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const response = await fetch(`${API_BASE}/export/conversation/${id}?format=${format}`, {
        headers: getAuthHeaders()
      });

      if (format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation_${id}.json`;
        a.click();
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation_${id}.${format}`;
        a.click();
      }
    } catch (error) {
      console.error('Error exporting conversation:', error);
      alert('Failed to export conversation');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!conversation) {
    return <div className="text-center py-12">Conversation not found</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <Link
            to="/conversations"
            className="text-indigo-600 hover:text-indigo-700 mb-2 inline-block font-medium transition-colors"
          >
            ← Back to Conversations
          </Link>
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-7 h-7 text-gray-700 dark:text-gray-200" strokeWidth={2.4} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
              {conversation.title || `Conversation ${conversation.id}`}
            </h1>
          </div>
        </div>
        <div className="flex space-x-2">
          <motion.button
            onClick={() => handleExport('json')}
            disabled={exporting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 font-medium"
          >
            Export JSON
          </motion.button>
          <motion.button
            onClick={() => handleExport('markdown')}
            disabled={exporting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 font-medium"
          >
            Export Markdown
          </motion.button>
        </div>
      </motion.div>

      {/* Conversation Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Platform', value: conversation.platform, capitalize: true },
            { label: 'Model', value: conversation.model },
            { label: 'Total Tokens', value: conversation.total_tokens?.toLocaleString() || 0 },
            { label: 'Total Cost', value: `$${(conversation.total_cost || 0).toFixed(4)}` }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <div className="text-sm text-gray-500 mb-1">{item.label}</div>
              <div className={`font-semibold text-gray-900 ${item.capitalize ? 'capitalize' : ''}`}>
                {item.value}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Messages */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden"
      >
        {conversation.messages && conversation.messages.length > 0 ? (
          conversation.messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className={`p-6 smooth-transition ${
                message.role === 'user' ? '' : 'bg-white'
              }`}
              style={message.role === 'user' ? { background: 'linear-gradient(to right, rgba(243, 244, 246, 0.7), rgba(229, 231, 235, 0.7))' } : {}}
            >
              <div className="flex items-start space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                    message.role === 'user'
                      ? 'text-white'
                      : ''
                  }`}
                  style={message.role === 'user' 
                    ? { background: 'linear-gradient(135deg, #111827, #030712)' }
                    : { background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)', color: '#374151' }
                  }
                >
                  {message.role === 'user' ? 'U' : 'A'}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900 capitalize">
                      {message.role}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                    {message.tokens && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                        {message.tokens.toLocaleString()} tokens
                      </span>
                    )}
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-2">💭</div>
            <p>No messages in this conversation</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ConversationView;

