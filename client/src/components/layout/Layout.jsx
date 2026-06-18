import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Navigation Sidebar (Desktop + Mobile overlay drawer) */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Mobile Sidebar backdrop overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main App Content Container */}
      <div className="flex flex-col flex-grow min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Inner Scrollable Viewport */}
        <main className="flex-grow p-6 overflow-y-auto min-w-0 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
