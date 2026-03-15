import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { THEMES } from '../utils/constants';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = storage.getTheme();
    return savedTheme || THEMES.LIGHT;
  });

  useEffect(() => {
    // Update localStorage
    storage.setTheme(theme);
    
    // Update document class
    document.documentElement.classList.remove(THEMES.LIGHT, THEMES.DARK);
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT);
  };

  const setLightTheme = () => setTheme(THEMES.LIGHT);
  const setDarkTheme = () => setTheme(THEMES.DARK);

  return {
    theme,
    isLight: theme === THEMES.LIGHT,
    isDark: theme === THEMES.DARK,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  };
};