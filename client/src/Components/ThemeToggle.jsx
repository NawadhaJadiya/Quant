import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-[5px] rounded-md transition-colors ${
        theme === 'dark' 
          ? 'bg-zinc-800 hover:bg-zinc-700' 
          : 'bg-gray-200 hover:bg-gray-300'
      }`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 text-blue-500" />
      )}
    </button>
  );
};

export default ThemeToggle; 