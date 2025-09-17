'use client';
import { useState } from 'react';
import { themes, ThemeName } from '@/lib/themes';

export default function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('cosmic');
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeName: ThemeName) => {
    setSelectedTheme(themeName);
    setIsOpen(false);
    // Store theme preference
    localStorage.setItem('ui-theme', themeName);
    // You can add logic here to apply the theme globally
    console.log(`Theme changed to: ${themes[themeName].name}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200"
      >
        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${themes[selectedTheme].primary}`}></div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {themes[selectedTheme].name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-50">
          <div className="p-2 space-y-1">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key as ThemeName)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200 ${
                  selectedTheme === key ? 'bg-gray-100/70 dark:bg-gray-700/70' : ''
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${theme.primary} shadow-lg`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {theme.name}
                </span>
                {selectedTheme === key && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}