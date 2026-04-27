import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

export default function Landing() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('facelens-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('facelens-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  return (
    <div className="landing-page">
      <header className="navbar">
        <div className="logo-container">
          <img src="/FaceLens.svg" alt="FaceLens Logo" className="logo" />
          <span className="brand-name">FaceLens</span>
        </div>
        <nav className="nav-links">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle landing-theme-toggle"
            title={theme === 'light' ? "Switch to Night Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? (
              <img src="https://img.icons8.com/ios-filled/24/1a2b4c/moon-symbol.png" alt="Moon icon" />
            ) : (
              <img src="https://img.icons8.com/ios-filled/24/ffffff/sun--v1.png" alt="Sun icon" />
            )}
          </button>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="nav-button primary">Get Started</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Effortless Photo Sharing Powered by AI</h1>
          <p>
            Instantly find and share your photos using advanced facial recognition.
            Just upload your albums, and we make sure everyone gets their memories seamlessly.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="cta-button primary">Try FaceLens Free</Link>
            <Link to="/login" className="cta-button secondary">Sign In</Link>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2670&auto=format&fit=crop" 
            alt="Friends looking at photos together" 
          />
        </div>
      </section>

      <section className="features">
        <h2>Why FaceLens?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <img src="/FaceLens.svg" alt="Face Match" className="feature-icon" />
            <h3>Smart Organization</h3>
            <p>Our AI intelligently scans and categorizes photos based on faces, saving you hours of manual sorting.</p>
          </div>
          <div className="feature-card">
            <img src="/FaceLens.svg" alt="Instant Sharing" className="feature-icon" />
            <h3>Instant Delivery</h3>
            <p>Guests receive their photos automatically without you having to hunt them down to share links.</p>
          </div>
          <div className="feature-card">
            <img src="/FaceLens.svg" alt="Secure Privacy" className="feature-icon" />
            <h3>Privacy First</h3>
            <p>We respect your privacy. Only you and the people recognized in the photos get access to the albums.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="logo-container">
            <img src="/FaceLens.svg" alt="FaceLens Logo" className="logo small-logo" />
            <span className="brand-name">FaceLens</span>
          </div>
          <p>&copy; {new Date().getFullYear()} FaceLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}