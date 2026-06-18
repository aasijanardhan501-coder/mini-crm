import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Menu, Bell } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  // Get Page Title from Pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/leads')) {
      if (path.includes('/new')) return 'Add New Lead';
      if (path.split('/').length > 2) return 'Lead Details';
      return 'Leads';
    }
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/profile')) return 'Profile Settings';
    return 'Mini CRM';
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-20 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
      
      {/* Title & Hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon (Placeholder for Premium Feel) */}
        <button className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 rotate-0 transition-transform duration-500" />
          ) : (
            <Moon className="w-4 h-4 rotate-360 transition-transform duration-500" />
          )}
        </button>

        {/* User Quick Info */}
        {user && (
          <div className="flex items-center gap-3 ml-2 border-l border-slate-100 dark:border-slate-800 pl-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {user.name}
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 capitalize">
                {user.role}
              </span>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 font-bold uppercase select-none">
              {user.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
