import { useEffect, useState } from "react";

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage, default to light mode (storage can throw on some browsers/modes)
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
    } catch {
      // ignore
    }
    // Default to light mode instead of system preference
    return false;
  });

  useEffect(() => {
    // Apply dark mode class on mount and when darkMode changes
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    try {
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  };

  return { darkMode, toggleDarkMode };
};
