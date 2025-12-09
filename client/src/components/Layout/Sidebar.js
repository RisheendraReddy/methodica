import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  MessageCircle,
  FolderOpen, 
  Tag, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const { theme } = useTheme();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/chat', icon: MessageSquare, label: 'New Chat' },
    { path: '/conversations', icon: MessageCircle, label: 'Conversations' },
    { path: '/folders', icon: FolderOpen, label: 'Folders' },
    { path: '/tags', icon: Tag, label: 'Tags' },
    { path: '/stats', icon: BarChart3, label: 'Statistics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-y-0 left-0 z-50 w-64 text-white shadow-2xl transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-black via-gray-950 to-black' 
          : 'bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800'
      }`}
    >
      <div className="flex flex-col h-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center h-20 px-6 border-b border-white/10 backdrop-blur-sm"
        >
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-200 via-slate-200 to-gray-100 bg-clip-text text-transparent" style={{ color: '#e8e8e8' }}>
            Methodica
          </h1>
        </motion.div>

        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.div
                key={item.path}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className={`group relative flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                    active
                      ? 'text-white bg-white/10 backdrop-blur-md shadow-lg shadow-gray-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-gray-200 to-gray-100 rounded-r-full"
                    style={{ background: 'linear-gradient(to bottom, #e5e7eb, #f3f4f6)' }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon 
                    className={`mr-3.5 h-5 w-5 transition-all duration-300 ${
                      active ? 'text-gray-200' : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className="relative z-10">{item.label}</span>
                  {active && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-500/10 to-slate-400/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 border-t border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center px-4 py-3 mb-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #e5e7eb, #f3f4f6)', boxShadow: '0 4px 12px rgba(229, 231, 235, 0.4)' }}>
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </motion.div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" strokeWidth={2} />
            Sign out
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
