import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const AddConversation = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    platform: '',
    model: '',
    title: '',
    messages: [{ role: 'user', content: '' }]
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.platform || !formData.model) {
      alert('Platform and model are required');
      return;
    }

    // Filter out empty messages
    const validMessages = formData.messages.filter(
      msg => msg.role && msg.content.trim()
    );

    if (validMessages.length === 0) {
      alert('At least one message is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          messages: validMessages
        })
      });

      if (response.ok) {
        alert('Conversation added successfully!');
        if (onSuccess) onSuccess();
        // Reset form
        setFormData({
          platform: '',
          model: '',
          title: '',
          messages: [{ role: 'user', content: '' }]
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add conversation');
      }
    } catch (error) {
      console.error('Error adding conversation:', error);
      alert('Failed to add conversation');
    } finally {
      setSubmitting(false);
    }
  };

  const addMessage = () => {
    setFormData({
      ...formData,
      messages: [...formData.messages, { role: 'assistant', content: '' }]
    });
  };

  const removeMessage = (index) => {
    setFormData({
      ...formData,
      messages: formData.messages.filter((_, i) => i !== index)
    });
  };

  const updateMessage = (index, field, value) => {
    const newMessages = [...formData.messages];
    newMessages[index] = { ...newMessages[index], [field]: value };
    setFormData({ ...formData, messages: newMessages });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Add New Conversation</h2>
        {onCancel && (
          <button className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Platform *</label>
          <input
            type="text"
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            placeholder="e.g., OpenAI, Anthropic, Google"
            required
          />
        </div>

        <div className="input-group">
          <label>Model *</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="e.g., gpt-4, claude-3, gemini-1.5-pro"
            required
          />
        </div>

        <div className="input-group">
          <label>Title (optional)</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Conversation title"
          />
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label>Messages *</label>
            <button
              type="button"
              className="button button-primary"
              onClick={addMessage}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
            >
              + Add Message
            </button>
          </div>

          {formData.messages.map((msg, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                padding: '1rem',
                marginBottom: '1rem',
                background: '#f8f9fa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <select
                  value={msg.role}
                  onChange={(e) => updateMessage(index, 'role', e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="user">User</option>
                  <option value="assistant">Assistant</option>
                  <option value="system">System</option>
                </select>
                {formData.messages.length > 1 && (
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={() => removeMessage(index)}
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <textarea
                value={msg.content}
                onChange={(e) => updateMessage(index, 'content', e.target.value)}
                placeholder="Message content..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
                required
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="button button-primary"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Conversation'}
          </button>
          {onCancel && (
            <button
              type="button"
              className="button button-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddConversation;


