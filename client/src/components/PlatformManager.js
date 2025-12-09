import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const PlatformManager = () => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    api_key: '',
    enabled: true
  });
  const [testing, setTesting] = useState({});

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/platforms`);
      const data = await response.json();
      setPlatforms(data);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/platforms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ name: '', api_key: '', enabled: true });
        setShowAddForm(false);
        fetchPlatforms();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save platform');
      }
    } catch (error) {
      console.error('Error saving platform:', error);
      alert('Failed to save platform');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this platform?')) {
      try {
        await fetch(`${API_BASE}/platforms/${id}`, {
          method: 'DELETE'
        });
        fetchPlatforms();
      } catch (error) {
        console.error('Error deleting platform:', error);
        alert('Failed to delete platform');
      }
    }
  };

  const handleTest = async (id, name) => {
    setTesting({ ...testing, [id]: true });
    try {
      const response = await fetch(`${API_BASE}/platforms/${id}/test`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.valid) {
        alert(`✅ Connection to ${name} successful!`);
      } else {
        alert(`❌ Connection failed: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Test failed: ${error.message}`);
    } finally {
      setTesting({ ...testing, [id]: false });
    }
  };

  const handleSync = async (platformName) => {
    try {
      const response = await fetch(`${API_BASE}/sync/${platformName}`, {
        method: 'POST'
      });
      const result = await response.json();
      alert(result.message || 'Sync completed');
    } catch (error) {
      alert(`Sync failed: ${error.message}`);
    }
  };

  const handleSyncAll = async () => {
    try {
      const response = await fetch(`${API_BASE}/sync`, {
        method: 'POST'
      });
      const result = await response.json();
      alert(`Sync completed for ${result.results.length} platforms`);
    } catch (error) {
      alert(`Sync failed: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading platforms...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Platform Management</h2>
          <div>
            <button
              className="button button-secondary"
              onClick={handleSyncAll}
              style={{ marginRight: '0.5rem' }}
            >
              Sync All
            </button>
            <button
              className="button button-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add Platform'}
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="input-group">
              <label>Platform Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., OpenAI, Anthropic, Google"
                required
              />
            </div>
            <div className="input-group">
              <label>API Key</label>
              <input
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder="Enter your API key"
                required
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
                Enabled
              </label>
            </div>
            <button type="submit" className="button button-primary">
              Save Platform
            </button>
          </form>
        )}
      </div>

      <div className="platform-list">
        {platforms.length === 0 ? (
          <div className="card empty-state">
            <h3>No platforms configured</h3>
            <p>Add a platform to start syncing your chat history</p>
          </div>
        ) : (
          platforms.map(platform => (
            <div key={platform.id} className="card">
              <div className="platform-item">
                <div className="platform-info">
                  <div>
                    <h3 style={{ marginBottom: '0.25rem' }}>{platform.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {platform.enabled ? '✅ Enabled' : '❌ Disabled'}
                    </div>
                  </div>
                </div>
                <div className="platform-actions">
                  <button
                    className="button button-secondary"
                    onClick={() => handleTest(platform.id, platform.name)}
                    disabled={testing[platform.id]}
                  >
                    {testing[platform.id] ? 'Testing...' : 'Test'}
                  </button>
                  <button
                    className="button button-primary"
                    onClick={() => handleSync(platform.name)}
                  >
                    Sync
                  </button>
                  <button
                    className="button button-danger"
                    onClick={() => handleDelete(platform.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlatformManager;

