import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API_BASE, { getAuthHeaders } from '../../config/api';

const Settings = ({ user }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'openai',
    api_key: ''
  });
  const [testing, setTesting] = useState({});

  const platforms = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google' }
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api-keys`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setApiKeys(Array.isArray(data) ? data : []);
      } else {
        setApiKeys([]);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = getAuthHeaders();
      const token = localStorage.getItem('firebase_token');
      
      if (!token) {
        alert('You are not logged in. Please refresh the page and log in again.');
        return;
      }
      
      const response = await fetch(`${API_BASE}/api-keys`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchApiKeys();
        setShowForm(false);
        setFormData({ platform: 'openai', api_key: '' });
        alert('API key saved successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 401) {
          alert('Authentication failed. Please refresh the page and log in again.');
        } else {
          alert(errorData.error || 'Failed to save API key');
        }
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('Failed to save API key. Please check your connection and try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) return;

    try {
      await fetch(`${API_BASE}/api-keys/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key');
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api-keys/${id}/toggle`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Error toggling API key:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300"
      >
        Settings
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">API Keys</h2>
          <motion.button
            onClick={() => setShowForm(!showForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : '+ Add API Key'}
          </motion.button>
        </div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl space-y-4 border border-slate-200"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              >
                {platforms.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                placeholder="Enter your API key"
                required
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              Save API Key
            </motion.button>
          </motion.form>
        )}

        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔑</div>
              <p className="text-gray-500">No API keys configured. Add your first API key to start chatting.</p>
            </motion.div>
          ) : (
            apiKeys.map((key, index) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 5, scale: 1.01 }}
                className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50/70 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="capitalize font-medium">{key.platform}</div>
                  <div className={`px-2 py-1 text-xs rounded ${
                    key.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {key.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleToggle(key.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    {key.is_active ? 'Disable' : 'Enable'}
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(key.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;

