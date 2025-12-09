import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { setMockToken } from '../../config/firebase';

// Google Logo SVG Component
const GoogleLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Apple Logo SVG Component
const AppleLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // For development: Simple mock login
  // In production, integrate with Firebase Auth
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Mock authentication for development
    // Replace this with Firebase Auth in production
    const mockUser = {
      id: 'user_' + Date.now(),
      email: email || 'demo@example.com',
      name: email.split('@')[0] || 'Demo User'
    };

    const mockToken = 'mock_token_' + Date.now();
    setMockToken(mockToken);

    // Verify with backend
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        onLogin(userData, mockToken);
      } else {
        // If backend doesn't recognize token, create user
        onLogin(mockUser, mockToken);
      }
    } catch (error) {
      // Fallback: just use mock user
      onLogin(mockUser, mockToken);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Nebula Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/nebula.jpg)',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 p-10 backdrop-blur-sm rounded-2xl shadow-2xl relative z-10 bg-black/85 border border-gray-800 text-white"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Methodica
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Sign in to manage your AI conversations
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-700 bg-gray-900/70 placeholder-gray-400 text-gray-100 focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                placeholder="Email address (optional for demo)"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-700 bg-gray-900/70 placeholder-gray-400 text-gray-100 focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                placeholder="Password (optional for demo)"
              />
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ background: 'linear-gradient(to right, #1f2937, #111827)' }}
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </motion.div>

          {/* Alt sign-in options */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <div className="h-px flex-1 bg-gray-800" />
              <span>Or continue with</span>
              <div className="h-px flex-1 bg-gray-800" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => console.log('Continue with Google')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900/60 text-gray-100 hover:border-gray-500 hover:bg-gray-800 transition-all duration-200"
              >
                <GoogleLogo className="w-5 h-5" />
                <span className="text-sm font-medium">Google</span>
              </button>

              <button
                type="button"
                onClick={() => console.log('Continue with Apple')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900/60 text-gray-100 hover:border-gray-500 hover:bg-gray-800 transition-all duration-200"
              >
                <AppleLogo className="w-5 h-5 text-white" />
                <span className="text-sm font-medium">Apple</span>
              </button>

              <button
                type="button"
                onClick={() => console.log('Continue with phone')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900/60 text-gray-100 hover:border-gray-500 hover:bg-gray-800 transition-all duration-200"
              >
                <Phone className="w-5 h-5" />
                <span className="text-sm font-medium">Phone</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-center text-gray-400">
            <p>Demo mode: Email and password are optional</p>
            <p className="mt-1">In production, integrate with Firebase Auth</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;

