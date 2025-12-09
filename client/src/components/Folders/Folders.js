import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API_BASE, { getAuthHeaders } from '../../config/api';

const Folders = ({ user }) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    color: '#667eea'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `${API_BASE}/folders/${editingId}`
        : `${API_BASE}/folders`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id || null
        })
      });

      if (response.ok) {
        fetchFolders();
        setShowForm(false);
        setFormData({ name: '', parent_id: '', color: '#667eea' });
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error saving folder:', error);
      alert('Failed to save folder');
    }
  };

  const handleEdit = (folder) => {
    setFormData({
      name: folder.name,
      parent_id: folder.parent_id || '',
      color: folder.color
    });
    setEditingId(folder.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this folder?')) return;

    try {
      await fetch(`${API_BASE}/folders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      fetchFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Failed to delete folder');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
          Folders
        </h1>
        <motion.button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', parent_id: '', color: '#667eea' });
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Folder'}
        </motion.button>
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Folder' : 'New Folder'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Folder (optional)
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">None</option>
                {folders
                  .filter((f) => !editingId || f.id !== editingId)
                  .map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              {editingId ? 'Update' : 'Create'} Folder
            </motion.button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-12"
          >
            <div className="text-6xl mb-4">📁</div>
            <p className="text-gray-500">No folders yet. Create your first folder to organize conversations.</p>
          </motion.div>
        ) : (
          folders.map((folder, index) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: folder.color }}
                  />
                  <h3 className="text-lg font-medium text-gray-900">
                    {folder.name}
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleEdit(folder)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(folder.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Created {new Date(folder.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Folders;

