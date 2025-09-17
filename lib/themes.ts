export const themes = {
  // Current Blue/Purple Theme
  cosmic: {
    name: 'Cosmic',
    primary: 'from-blue-500 via-purple-500 to-indigo-500',
    secondary: 'from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30',
    accent: 'from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30',
    text: 'from-blue-600 via-purple-600 to-indigo-600',
    border: 'border-blue-100 dark:border-blue-800',
    bg: 'from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/30'
  },
  
  // Original Green Theme
  nature: {
    name: 'Nature',
    primary: 'from-emerald-500 via-green-500 to-teal-500',
    secondary: 'from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30',
    accent: 'from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30',
    text: 'from-emerald-600 via-green-500 to-teal-500',
    border: 'border-emerald-100 dark:border-emerald-800',
    bg: 'from-gray-50 via-white to-emerald-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/30'
  },
  
  // Sunset Theme
  sunset: {
    name: 'Sunset',
    primary: 'from-orange-500 via-red-500 to-pink-500',
    secondary: 'from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30',
    accent: 'from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30',
    text: 'from-orange-600 via-red-500 to-pink-500',
    border: 'border-orange-100 dark:border-orange-800',
    bg: 'from-gray-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-orange-950/30'
  },
  
  // Ocean Theme
  ocean: {
    name: 'Ocean',
    primary: 'from-cyan-500 via-blue-500 to-indigo-500',
    secondary: 'from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30',
    accent: 'from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30',
    text: 'from-cyan-600 via-blue-500 to-indigo-500',
    border: 'border-cyan-100 dark:border-cyan-800',
    bg: 'from-gray-50 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/30'
  },
  
  // Monochrome Theme
  mono: {
    name: 'Monochrome',
    primary: 'from-gray-600 via-gray-700 to-gray-800',
    secondary: 'from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30',
    accent: 'from-gray-100 to-gray-200 dark:from-gray-700/30 dark:to-gray-800/30',
    text: 'from-gray-700 via-gray-800 to-gray-900',
    border: 'border-gray-200 dark:border-gray-700',
    bg: 'from-gray-50 via-white to-gray-100/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30'
  }
};

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes[ThemeName];