import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function GlobalThemeToggle() {
  const [theme, setTheme] = useState('light');
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('facelens-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, [location.pathname]); // Re-check when route changes just in case

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('facelens-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // The landing page has its own toggle in the navbar, avoid duplicates.
  // Actually, the user says "keep night mode button constant for every page", 
  // maybe it's better to render it globally and remove local ones, or keep local one on landing?
  // Let's render it directly next to the global logo, except when on Landing since Landing has a structured navbar.
  if (location.pathname === '/') return null;

  return (
    <button 
      onClick={toggleTheme} 
      className="global-theme-toggle theme-toggle"
      title={theme === 'light' ? "Switch to Night Mode" : "Switch to Light Mode"}
    >
      {theme === 'light' ? (
        <img src="https://img.icons8.com/ios-filled/24/1a2b4c/moon-symbol.png" alt="Moon icon" />
      ) : (
        <img src="https://img.icons8.com/ios-filled/24/ffffff/sun--v1.png" alt="Sun icon" />
      )}
    </button>
  );
}