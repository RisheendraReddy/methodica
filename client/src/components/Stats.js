import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/chat/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="empty-state">Failed to load statistics</div>;
  }

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Statistics</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalConversations || 0}</div>
          <div className="stat-label">Total Conversations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalMessages || 0}</div>
          <div className="stat-label">Total Messages</div>
        </div>
      </div>

      {stats.byPlatform && stats.byPlatform.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>By Platform</h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {stats.byPlatform.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: '#f8f9fa',
                  borderRadius: '6px'
                }}
              >
                <span style={{ fontWeight: 500 }}>{item.platform}</span>
                <span style={{ color: '#667eea', fontWeight: 600 }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.byModel && stats.byModel.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>By Model</h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {stats.byModel.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: '#f8f9fa',
                  borderRadius: '6px'
                }}
              >
                <span style={{ fontWeight: 500 }}>{item.model}</span>
                <span style={{ color: '#667eea', fontWeight: 600 }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;

