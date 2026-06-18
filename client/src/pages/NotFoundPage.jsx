import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-9xl font-black text-brand-600 dark:text-brand-500 tracking-widest animate-bounce">
        404
      </h2>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-4">
        Page Not Found
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
        The link you followed may be broken or the page may have been removed. Let's get you back on track.
      </p>
      <Button
        onClick={() => navigate('/')}
        className="mt-6 shadow-md shadow-brand-500/10"
      >
        Back to Dashboard
      </Button>
    </div>
  );
};

export default NotFoundPage;
