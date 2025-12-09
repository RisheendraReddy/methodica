import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ChatInterface from './components/Chat/ChatInterface';
import ConversationsList from './components/Conversations/ConversationsList';
import ConversationView from './components/Conversations/ConversationView';
import Folders from './components/Folders/Folders';
import Tags from './components/Tags/Tags';
import Settings from './components/Settings/Settings';
import Stats from './components/Stats/Stats';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import './App.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

const AnimatedRoutes = ({ user }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Dashboard user={user} />
          </motion.div>
        } />
        <Route path="/chat" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ChatInterface user={user} />
          </motion.div>
        } />
        <Route path="/chat/:conversationId" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ChatInterface user={user} />
          </motion.div>
        } />
        <Route path="/conversations" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ConversationsList user={user} />
          </motion.div>
        } />
        <Route path="/conversations/:id" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ConversationView user={user} />
          </motion.div>
        } />
        <Route path="/folders" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Folders user={user} />
          </motion.div>
        } />
        <Route path="/tags" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Tags user={user} />
          </motion.div>
        } />
        <Route path="/stats" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Stats user={user} />
          </motion.div>
        } />
        <Route path="/settings" element={
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Settings user={user} />
          </motion.div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('firebase_token');
    if (token) {
      // Verify token with backend
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            setUser(data);
          } else {
            localStorage.removeItem('firebase_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('firebase_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('firebase_token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('firebase_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="spinner mx-auto mb-4" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
          <div className="text-white text-xl font-medium">Loading...</div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 dark:from-gray-950 dark:via-black dark:to-gray-950 transition-colors duration-300">
          <Sidebar user={user} onLogout={handleLogout} />
          <div className="lg:pl-64">
            <Header user={user} />
            <main className="p-8 page-transition">
              <AnimatedRoutes user={user} />
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
