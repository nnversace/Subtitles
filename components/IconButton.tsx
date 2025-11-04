
import React from 'react';

interface IconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  tooltip: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ onClick, children, tooltip }) => {
  return (
    <div className="relative group flex items-center">
      <button
        onClick={onClick}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors"
      >
        {children}
      </button>
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none dark:bg-gray-200 dark:text-gray-800">
        {tooltip}
      </div>
    </div>
  );
};