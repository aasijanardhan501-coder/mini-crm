import React from 'react';

const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const baseStyles = 'bg-slate-200 dark:bg-slate-800 animate-pulse';

  const variants = {
    text: 'h-4 w-full rounded',
    title: 'h-6 w-3/4 rounded-md',
    circle: 'rounded-full',
    rect: 'rounded-xl',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
