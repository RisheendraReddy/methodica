import React from 'react';

const Header = ({ view, setView, onBack }) => {
  return (
    <header className="header">
      <h1>🤖 AI Chat History Manager</h1>
      <div className="nav-buttons">
        {view === 'conversation' && (
          <button className="nav-button back-button" onClick={onBack}>
            ← Back
          </button>
        )}
        <button
          className={`nav-button ${view === 'conversations' ? 'active' : ''}`}
          onClick={() => setView('conversations')}
        >
          Conversations
        </button>
        <button
          className={`nav-button ${view === 'platforms' ? 'active' : ''}`}
          onClick={() => setView('platforms')}
        >
          Platforms
        </button>
        <button
          className={`nav-button ${view === 'stats' ? 'active' : ''}`}
          onClick={() => setView('stats')}
        >
          Statistics
        </button>
      </div>
    </header>
  );
};

export default Header;


