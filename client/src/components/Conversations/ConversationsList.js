import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, FolderOpen, Trash2 } from 'lucide-react';
import API_BASE, { getAuthHeaders } from '../../config/api';

const ConversationsList = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    platform: '',
    model: '',
    folder_id: '',
    search: ''
  });
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    fetchConversations();
    fetchFolders();
  }, [filters]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.model) params.append('model', filters.model);
      if (filters.folder_id) params.append('folder_id', filters.folder_id);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${API_BASE}/conversations?${params}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch(`${API_BASE}/folders`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setFolders(Array.isArray(data) ? data : []);
      } else {
        setFolders([]);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      setFolders([]);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await fetch(`${API_BASE}/conversations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      fetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
          Conversations
        </h1>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/chat"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>New Chat</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 transition-all duration-200 hover:border-gray-200 bg-white/95 backdrop-blur-sm text-[15px] shadow-sm"
            style={{ borderColor: '#e5e7eb' }}
          />

          <select
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
            className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 transition-all duration-200 hover:border-gray-200 bg-white/95 backdrop-blur-sm text-[15px] shadow-sm"
            style={{ borderColor: '#e5e7eb' }}
          >
            <option value="">All Platforms</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="google">Google</option>
          </select>

          <select
            value={filters.folder_id}
            onChange={(e) => setFilters({ ...filters, folder_id: e.target.value })}
            className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 transition-all duration-200 hover:border-gray-200 bg-white/95 backdrop-blur-sm text-[15px] shadow-sm"
            style={{ borderColor: '#e5e7eb' }}
          >
            <option value="">All Folders</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>

          <motion.button
            onClick={() => setFilters({ platform: '', model: '', folder_id: '', search: '' })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2.5 border border-gray-200/50 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-[15px] bg-white/80 backdrop-blur-sm shadow-sm"
          >
            Clear Filters
          </motion.button>
        </div>
      </motion.div>

      {/* Conversations List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm divide-y divide-gray-100/50 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
        <AnimatePresence mode="wait">
          {conversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-16 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 border" style={{ background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', borderColor: '#d1d5db' }}>
                <FolderOpen className="w-8 h-8" style={{ color: '#4b5563' }} strokeWidth={2} />
              </div>
              <p className="text-gray-600 font-medium mb-2 text-[15px]">No conversations found</p>
              <Link
                to="/chat"
                className="btn-primary inline-flex items-center space-x-2 mt-4"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>Start a new conversation</span>
              </Link>
            </motion.div>
          ) : (
            conversations.map((conv, index) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.03 }}
                className="p-6 hover:bg-gradient-to-r hover:from-slate-50/70 hover:to-gray-50/70 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <Link
                    to={`/chat/${conv.id}`}
                    className="flex-1"
                  >
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-slate-700 transition-colors mb-2">
                      {conv.title || `Conversation ${conv.id}`}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span className="px-2.5 py-1 rounded-lg capitalize text-xs font-medium border" style={{ background: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }}>
                        {conv.platform}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>{conv.model}</span>
                      <span className="text-gray-400">•</span>
                      <span>{new Date(conv.updated_at).toLocaleDateString()}</span>
                      {conv.total_tokens && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded-lg text-xs">
                            {conv.total_tokens.toLocaleString()} tokens
                          </span>
                        </>
                      )}
                    </div>
                    {conv.tags && Array.isArray(conv.tags) && conv.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {conv.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2.5 py-1 text-xs rounded-lg font-medium shadow-sm"
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                  <motion.button
                    onClick={(e) => handleDelete(conv.id, e)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="ml-4 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConversationsList;

