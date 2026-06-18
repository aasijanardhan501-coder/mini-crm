import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Portal/Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full sm:w-96 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Internal Toast Item Component
const ToastItem = ({ message, type, onClose }) => {
  const typeStyles = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      text: 'text-emerald-800 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-800/50',
      text: 'text-rose-800 dark:text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/50',
      text: 'text-amber-800 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800/50',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <Info className="w-5 h-5 text-blue-500" />,
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${style.bg} ${style.border} ${style.text} shadow-lg shadow-slate-100/50 dark:shadow-none animate-slide-in transition-all duration-300`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-grow text-sm font-medium leading-5">{message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-1 p-0.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/55 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
