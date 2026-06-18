import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Leads', path: '/leads', icon: <Users className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 transform md:translate-x-0 md:static
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${sidebarWidth}`}
    >
      {/* Sidebar Header / Brand Logo */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
            <TrendingUp className="w-6 h-6 animate-pulse" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-500 dark:to-indigo-400 bg-clip-text text-transparent">
              Mini CRM
            </span>
          )}
        </div>
        
        {/* Toggle Collapse Button (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setIsOpen(false)} // Close mobile drawer
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group
              ${isActive 
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
              }
            `}
          >
            <span className="flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              {item.icon}
            </span>
            {!isCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer User & Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 font-bold uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user.name}
              </p>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-medium text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/10 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
