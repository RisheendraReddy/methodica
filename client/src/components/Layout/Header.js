import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import API_BASE, { getAuthHeaders } from '../../config/api';

const Header = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/search/text?q=${encodeURIComponent(searchQuery)}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setSearchResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleResultClick = (conversationId) => {
    navigate(`/conversations/${conversationId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showResults && !event.target.closest('.search-container')) {
        setShowResults(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showResults]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b sticky top-0 z-40 transition-colors duration-300"
      style={{ borderColor: '#e5e7eb' }}
    >
      <div className="px-8 py-5 flex items-center justify-between">
        <form onSubmit={handleSearch} className="relative max-w-2xl flex-1 search-container">
          <motion.div
            className="relative"
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-400/10 to-gray-300/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search conversations..."
              className="relative w-full pl-14 pr-6 py-3.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border rounded-full focus:ring-2 focus:ring-gray-300/50 dark:focus:ring-gray-600/50 focus:border-gray-300 dark:focus:border-gray-600 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg text-[15px] placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
              style={{ 
                borderColor: '#e5e7eb',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.05)'
              }}
            />
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" strokeWidth={2} />
            </div>
          </motion.div>

          <AnimatePresence>
            {showResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 w-full mt-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border rounded-2xl shadow-2xl max-h-96 overflow-y-auto transition-colors duration-300"
                style={{ 
                  borderColor: '#e5e7eb',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              >
                {searchResults.map((result, index) => (
                  <motion.div
                    key={result.message_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleResultClick(result.conversation_id)}
                    className="p-4 hover:bg-gradient-to-r hover:from-slate-50/70 dark:hover:from-gray-800/70 hover:to-gray-50/70 dark:hover:to-gray-700/70 cursor-pointer border-b last:border-b-0 transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl"
                  style={{ borderColor: '#f3f4f6' }}
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-300">
                      {result.conversation_title || `Conversation ${result.conversation_id}`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed transition-colors duration-300">
                      {result.content}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
        
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="ml-4 p-2.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border transition-all duration-300 hover:shadow-md"
          style={{ borderColor: '#e5e7eb' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" strokeWidth={2} />
          ) : (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" strokeWidth={2} />
          )}
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Header;
