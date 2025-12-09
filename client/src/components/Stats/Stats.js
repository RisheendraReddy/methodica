import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Mail, 
  Hash, 
  DollarSign
} from 'lucide-react';
import API_BASE, { getAuthHeaders } from '../../config/api';

const Stats = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/stats`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  if (!stats) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-slate-100 mb-4 border" style={{ borderColor: '#d1d5db' }}>
          <span className="text-3xl">❌</span>
        </div>
        <p className="text-gray-600 font-medium text-[15px]">Failed to load statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300"
      >
        Statistics
      </motion.h1>

      {/* Overview Cards */}
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
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              style={{
                borderColor: '#e5e7eb',
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

      {/* By Platform */}
      {stats.by_platform && Array.isArray(stats.by_platform) && stats.by_platform.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm p-6"
          style={{ borderColor: '#e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">By Platform</h2>
          <div className="space-y-3">
            {stats.by_platform.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ x: 5, scale: 1.01 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border hover:border-gray-300 transition-all duration-200"
                style={{ borderColor: '#e5e7eb' }}
              >
                <div>
                  <div className="font-medium capitalize">{item.platform}</div>
                  <div className="text-sm text-gray-500">
                    {item.count} conversations
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.tokens?.toLocaleString() || 0} tokens</div>
                  <div className="text-sm text-gray-500">
                    ${(item.cost || 0).toFixed(2)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* By Model */}
      {stats.by_model && Array.isArray(stats.by_model) && stats.by_model.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm p-6"
          style={{ borderColor: '#e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">By Model</h2>
          <div className="space-y-3">
            {stats.by_model.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                whileHover={{ x: 5, scale: 1.01 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border hover:border-gray-300 transition-all duration-200"
                style={{ borderColor: '#e5e7eb' }}
              >
                <div>
                  <div className="font-medium">{item.model}</div>
                  <div className="text-sm text-gray-500">
                    {item.count} conversations
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.tokens?.toLocaleString() || 0} tokens</div>
                  <div className="text-sm text-gray-500">
                    ${(item.cost || 0).toFixed(2)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Monthly Usage */}
      {stats.monthly_usage && Array.isArray(stats.monthly_usage) && stats.monthly_usage.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm p-6"
          style={{ borderColor: '#e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Monthly Usage</h2>
          <div className="space-y-3">
            {stats.monthly_usage.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                whileHover={{ x: 5, scale: 1.01 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border hover:border-gray-300 transition-all duration-200"
                style={{ borderColor: '#e5e7eb' }}
              >
                <div>
                  <div className="font-medium">
                    {new Date(item.year, item.month - 1).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.conversations} conversations
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.tokens?.toLocaleString() || 0} tokens</div>
                  <div className="text-sm text-gray-500">
                    ${(item.cost || 0).toFixed(2)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Stats;

