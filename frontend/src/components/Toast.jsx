import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  }[type];

  return (
    <div
      className={`
        fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white
        ${bgColor} animate-slide-in-right
        flex items-center gap-3
        transform transition-all duration-300
      `}
    >
      <span className="text-xl font-bold">{icon}</span>
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default Toast;
