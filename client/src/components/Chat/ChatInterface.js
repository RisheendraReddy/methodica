import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import API_BASE, { getAuthHeaders } from '../../config/api';

const ChatInterface = ({ user }) => {
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo-preview');
  const [availableModels, setAvailableModels] = useState({});
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const messagesEndRef = useRef(null);

  const platforms = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google'
  };

  useEffect(() => {
    fetchModels();
    fetchFolders();
    
    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchModels = async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/models`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setAvailableModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
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

  const fetchConversation = async () => {
    try {
      const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`Failed to load conversation: ${response.statusText}`);
      }
      const data = await response.json();
      setConversation(data);
      
      // Sort messages by created_at to ensure correct order
      const sortedMessages = (data.messages || []).sort((a, b) => {
        const dateA = new Date(a.created_at || a.id);
        const dateB = new Date(b.created_at || b.id);
        return dateA - dateB;
      });
      
      setMessages(sortedMessages);
      setSelectedPlatform(data.platform);
      setSelectedModel(data.model);
      setSelectedFolder(data.folder_id);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      alert(`Error loading conversation: ${error.message}`);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const messageContent = input.trim();
    const userMessage = {
      role: 'user',
      content: messageContent
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          conversation_id: conversationId || null,
          platform: selectedPlatform,
          model: selectedModel,
          message: messageContent,
          folder_id: selectedFolder
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        const errorMsg = data.error || `Error: ${response.status} ${response.statusText}`;
        console.error('API Error:', errorMsg, data);
        alert(`Error: ${errorMsg}\n\nPlease check:\n1. Your API key is configured in Settings\n2. The API key is correct\n3. You have sufficient credits`);
        return;
      }

      if (data.conversation_id) {
        if (!conversationId) {
          window.history.pushState({}, '', `/chat/${data.conversation_id}`);
        }
        setConversation({ id: data.conversation_id });
      }

      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      } else {
        console.error('No message in response:', data);
        alert('Received response but no message content. Check console for details.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Error sending message: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. Your internet connection\n3. API keys in Settings`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white/95 backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden smooth-transition" style={{ borderColor: '#e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-white/90 to-gray-50/50 backdrop-blur-sm"
        style={{ borderColor: '#e5e7eb' }}
      >
        <div className="flex items-center space-x-3 flex-1">
          {conversation && conversation.title && (
            <h2 className="text-lg font-semibold text-gray-900 mr-4 truncate">
              {conversation.title}
            </h2>
          )}
          <div className="flex items-center space-x-3">
          <select
            value={selectedPlatform}
            onChange={(e) => {
              setSelectedPlatform(e.target.value);
              const models = availableModels[e.target.value] || [];
              if (models.length > 0) {
                setSelectedModel(models[0].id);
              }
            }}
            className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 transition-all duration-200 hover:border-gray-200 bg-white/95 backdrop-blur-sm font-medium text-[15px] shadow-sm"
            style={{ borderColor: '#e5e7eb' }}
          >
            {Object.entries(platforms).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 transition-all duration-200 hover:border-gray-200 bg-white/95 backdrop-blur-sm font-medium text-[15px] shadow-sm"
            style={{ borderColor: '#e5e7eb' }}
          >
            {availableModels[selectedPlatform]?.map((model) => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>

          <select
            value={selectedFolder || ''}
            onChange={(e) => setSelectedFolder(e.target.value || null)}
            className="px-4 py-2.5 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all duration-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm text-[15px] shadow-sm"
          >
            <option value="">No Folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-gradient-to-b from-white to-gray-50/50">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-gray-500 mt-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 border" style={{ background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', borderColor: '#d1d5db' }}>
                <MessageCircle className="w-10 h-10" style={{ color: '#4b5563' }} strokeWidth={2} />
              </div>
              <p className="text-xl font-semibold text-gray-900 mb-2">Start a new conversation</p>
              <p className="text-sm text-gray-500">Select a platform and model, then type your message below</p>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`max-w-3xl rounded-2xl px-5 py-4 shadow-sm smooth-transition ${
                  message.role === 'user'
                    ? 'text-white'
                    : 'bg-white/90 backdrop-blur-sm text-gray-900 border'
                }`}
                style={message.role === 'user' 
                  ? { background: 'linear-gradient(135deg, #111827, #030712)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)' }
                  : { borderColor: '#e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }
                }
              >
                <div className="text-xs font-semibold mb-2 opacity-80 uppercase tracking-wide">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                {message.tokens && (
                  <div className="text-xs mt-3 opacity-60 pt-2 border-t border-white/20">
                    {message.tokens.toLocaleString()} tokens
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl px-5 py-3 shadow-md border" style={{ borderColor: '#e5e7eb' }}>
                <div className="flex space-x-2 items-center">
                  <div className="spinner"></div>
                  <span className="text-sm text-gray-500 ml-2">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-5 border-t bg-white/90 backdrop-blur-sm" style={{ borderColor: '#e5e7eb' }}>
        <div className="flex space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            rows="3"
            className="flex-1 px-5 py-3.5 border rounded-2xl focus:ring-2 focus:ring-gray-300/50 focus:border-gray-300 resize-none transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md text-[15px] placeholder:text-gray-400"
            style={{ borderColor: '#e5e7eb' }}
            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }}
            disabled={loading}
          />
          <motion.button
            type="submit"
            disabled={loading || !input.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3.5 text-white rounded-full font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            style={{ background: 'linear-gradient(to right, #1f2937, #111827)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)' }}
          >
            <span className="text-[15px]">Send</span>
            <Send className="w-4 h-4" strokeWidth={2.5} />
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;

