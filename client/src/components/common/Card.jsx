import React from 'react';

const Card = ({ children, className = '', onClick = null }) => {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm shadow-slate-100/40 dark:shadow-none transition-all duration-300
        ${isClickable 
          ? 'cursor-pointer hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 active:scale-99 hover:-translate-y-0.5' 
          : ''
        } 
        ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
