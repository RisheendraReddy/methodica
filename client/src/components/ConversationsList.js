import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const ConversationsList = ({ conversations, loading, onSelect, onRefresh }) => {
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterModel, setFilterModel] = useState('');

  const getBadgeClass = (platform) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('openai') || platformLower.includes('gpt')) {
      return 'badge-openai';
    } else if (platformLower.includes('anthropic') || platformLower.includes('claude')) {
      return 'badge-anthropic';
    } else if (platformLower.includes('google') || platformLower.includes('gemini')) {
      return 'badge-google';
    }
    return 'badge-default';
  };

  const filteredConversations = conversations.filter(conv => {
    if (filterPlatform && !conv.platform.toLowerCase().includes(filterPlatform.toLowerCase())) {
      return false;
    }
    if (filterModel && !conv.model.toLowerCase().includes(filterModel.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await fetch(`${API_BASE}/chat/conversations/${id}`, {
          method: 'DELETE'
        });
        onRefresh();
      } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('Failed to delete conversation');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading conversations...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Conversations</h2>
          <button className="button button-primary" onClick={onRefresh}>
            Refresh
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Filter by platform..."
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
            />
          </div>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Filter by model..."
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredConversations.length === 0 ? (
        <div className="card empty-state">
          <h3>No conversations found</h3>
          <p>Start adding conversations or sync from your platforms</p>
        </div>
      ) : (
        filteredConversations.map(conv => (
          <div
            key={conv.id}
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(conv.id)}
          >
            <div className="card-header">
              <div>
                <div className="card-title">
                  {conv.title || `Conversation ${conv.id}`}
                </div>
                <div className="card-subtitle">
                  <span className={`badge ${getBadgeClass(conv.platform)}`}>
                    {conv.platform}
                  </span>
                  {' • '}
                  {conv.model}
                  {' • '}
                  {conv.message_count || 0} messages
                </div>
              </div>
              <button
                className="button button-danger"
                onClick={(e) => handleDelete(conv.id, e)}
              >
                Delete
              </button>
            </div>
            <div style={{ color: '#666', fontSize: '0.85rem' }}>
              Created: {new Date(conv.created_at).toLocaleString()}
              {conv.last_message_time && (
                <> • Last message: {new Date(conv.last_message_time).toLocaleString()}</>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ConversationsList;

