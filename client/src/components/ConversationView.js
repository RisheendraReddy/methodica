import React from 'react';

const ConversationView = ({ conversation, onBack }) => {
  if (!conversation) {
    return <div className="loading">Loading conversation...</div>;
  }

  const getMessageClass = (role) => {
    switch (role) {
      case 'user':
        return 'message-user';
      case 'assistant':
        return 'message-assistant';
      case 'system':
        return 'message-system';
      default:
        return 'message';
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              {conversation.title || `Conversation ${conversation.id}`}
            </h2>
            <div className="card-subtitle">
              {conversation.platform} • {conversation.model}
            </div>
          </div>
        </div>
        <div style={{ color: '#666', fontSize: '0.9rem' }}>
          Created: {new Date(conversation.created_at).toLocaleString()}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Messages ({conversation.messages?.length || 0})</h3>
        {conversation.messages && conversation.messages.length > 0 ? (
          conversation.messages.map((msg, index) => (
            <div key={index} className={`message ${getMessageClass(msg.role)}`}>
              <div className="message-role">{msg.role}</div>
              <div className="message-content">{msg.content}</div>
              {msg.timestamp && (
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
                  {new Date(msg.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No messages in this conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationView;


