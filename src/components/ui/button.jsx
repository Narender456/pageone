// src/components/ui/button.js

import React from 'react';

export const Button = ({ children, onClick, variant = 'default', ...props }) => {
  const baseStyles = 'px-4 py-2 font-semibold rounded';
  const variantStyles = variant === 'outline' 
    ? 'border border-gray-500 text-gray-500' 
    : 'bg-blue-500 text-white';

  return (
    <button onClick={onClick} className={`${baseStyles} ${variantStyles}`} {...props}>
      {children}
    </button>
  );
};
