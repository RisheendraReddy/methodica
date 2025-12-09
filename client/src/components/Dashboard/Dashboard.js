import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Mail, 
  Hash, 
  DollarSign, 
  Plus,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import API_BASE, { getAuthHeaders } from '../../config/api';

const Dashboard = ({ user }) => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, conversationsRes] = await Promise.all([
        fetch(`${API_BASE}/stats`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/conversations?per_page=5`, { headers: getAuthHeaders() })
      ]);

      const statsData = await statsRes.json();
      const conversationsData = await conversationsRes.json();

      setStats(statsData);
      setRecentConversations(conversationsData.conversations || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-500 text-[15px]">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
          Dashboard
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

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: 'Total Conversations', 
              value: stats.total_conversations || 0, 
              icon: MessageSquare, 
              gradient: 'linear-gradient(135deg, #d1d5db, #e5e7eb)',
              bgGradient: 'from-gray-50 to-slate-50'
            },
            { 
              label: 'Total Messages', 
              value: stats.total_messages || 0, 
              icon: Mail, 
              gradient: 'linear-gradient(135deg, #9ca3af, #d1d5db)',
              bgGradient: 'from-gray-50 to-slate-50'
            },
            { 
              label: 'Total Tokens', 
              value: stats.total_tokens?.toLocaleString() || 0, 
              icon: Hash, 
              gradient: 'linear-gradient(135deg, #e5e7eb, #f3f4f6)',
              bgGradient: 'from-gray-50 to-slate-50'
            },
            { 
              label: 'Total Cost', 
              value: `$${(stats.total_cost || 0).toFixed(2)}`, 
              icon: DollarSign, 
              gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
              bgGradient: 'from-gray-50 to-slate-50'
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                style={{
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: stat.gradient, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
                      <Icon className="w-6 h-6" style={{ color: '#1f2937' }} strokeWidth={2.5} />
                    </div>
                  </div>
                <div className="text-xs font-medium uppercase tracking-wider mb-2 text-black">
                  {stat.label}
                </div>
                <div className="text-3xl font-bold text-gray-900 tracking-tight">
                  {stat.value}
                </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recent Conversations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-900/80 border-gray-800' 
            : 'bg-white/80 border-gray-200'
        }`}
        style={theme === 'dark' 
          ? { boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)' }
          : { boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }
        }
      >
        <div className={`p-6 border-b bg-gradient-to-r transition-colors duration-300 ${
          theme === 'dark' 
            ? 'border-gray-800 from-gray-800/50 to-gray-900/50' 
            : 'border-gray-200 from-gray-50/50 to-white/50'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold tracking-tight transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Recent Conversations</h2>
            <Link
              to="/conversations"
              className={`text-sm font-medium transition-colors inline-flex items-center space-x-1 ${
                theme === 'dark' 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
        </div>

        <div className="divide-y divide-gray-100/50">
          {!Array.isArray(recentConversations) || recentConversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-16 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 border" style={{ background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', borderColor: '#d1d5db' }}>
                <MessageCircle className="w-8 h-8" style={{ color: '#4b5563' }} strokeWidth={2} />
              </div>
              <p className="text-gray-600 font-medium mb-2 text-[15px]">No conversations yet</p>
              <p className="text-sm text-gray-500 mb-6">Start chatting to see your conversations here</p>
              <Link
                to="/chat"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>Start your first conversation</span>
              </Link>
            </motion.div>
          ) : (
            recentConversations.map((conv, index) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <Link
                  to={`/chat/${conv.id}`}
                  className={`block p-6 transition-all duration-200 group ${
                    theme === 'dark' 
                      ? 'hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50' 
                      : 'hover:bg-gradient-to-r hover:from-slate-50/70 hover:to-gray-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base font-semibold transition-colors mb-2 truncate ${
                        theme === 'dark' 
                          ? 'text-white group-hover:text-gray-200' 
                          : 'text-gray-900 group-hover:text-slate-700'
                      }`}>
                        {conv.title || `Conversation ${conv.id}`}
                      </h3>
                      <div className={`flex items-center space-x-3 text-sm transition-colors duration-300 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border transition-colors duration-300 ${
                          theme === 'dark' 
                            ? 'bg-gray-800 text-gray-200 border-gray-700' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {conv.platform}
                        </span>
                        <span className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}>•</span>
                        <span>{conv.model}</span>
                        <span className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}>•</span>
                        <span>{new Date(conv.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <motion.div
                      className="ml-4 flex-shrink-0"
                      whileHover={{ x: 5 }}
                    >
                      <ArrowRight className={`w-5 h-5 transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-500 group-hover:text-gray-300' 
                          : 'text-gray-400 group-hover:text-slate-600'
                      }`} strokeWidth={2} />
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
