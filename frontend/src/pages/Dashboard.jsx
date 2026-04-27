import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));

    const savedTheme = localStorage.getItem('facelens-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, [navigate]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('facelens-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={`dashboard-container ${theme}`}>
      <div className="top-bar">
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <div className="dashboard-content">
        <h1>Welcome, {user?.username || 'User'}!</h1>
        <p>What would you like to do today?</p>
        <div className="action-panels">
          <div className="action-panel create-panel" onClick={() => navigate('/events/create')}>
            <h3>Create a New Event</h3>
            <p>Host a new event and share a unique password for attendees to upload and view photos securely.</p>
          </div>
          <div className="action-panel join-panel" onClick={() => navigate('/events/login')}>
            <h3>Join an Event</h3>
            <p>Enter an event name and password to access its exclusive photo gallery and upload your pictures.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
