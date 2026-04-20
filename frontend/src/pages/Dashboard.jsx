import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
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

  const handleUploadPhoto = () => {
    // TODO: Implement photo upload functionality
    alert('Photo upload coming soon!');
  };

  return (
    <div className={`dashboard-container ${theme}`}>
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="logo-container">
            <img src="/FaceLens.svg" alt="FaceLens Logo" className="navbar-logo" />
            <h1 className="app-title">FaceLens</h1>
          </Link>
          {user && (
            <div className="user-actions">
              <button 
                onClick={toggleTheme} 
                className="theme-toggle"
                title={theme === 'light' ? "Switch to Night Mode" : "Switch to Light Mode"}
              >
                {theme === 'light' ? (
                  <img src="https://img.icons8.com/ios-filled/24/1a2b4c/moon-symbol.png" alt="Moon icon" />
                ) : (
                  <img src="https://img.icons8.com/ios-filled/24/ffffff/sun--v1.png" alt="Sun icon" />
                )}
              </button>
              <div className="user-info">
                <span className="username">{user.username}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="dashboard-main">
        <section className="welcome-section">
          <h2>Welcome, {user?.firstName || user?.username}!</h2>
          <p>Upload and analyze photos with face recognition</p>
        </section>

        <section className="photos-section">
          <div className="section-header">
            <h3>Your Photos</h3>
            <button onClick={handleUploadPhoto} className="btn-upload">
              Upload Photo
            </button>
          </div>

          {photos.length === 0 ? (
            <div className="empty-state">
              <p>No photos yet. Start by uploading your first photo!</p>
              <button onClick={handleUploadPhoto} className="btn-upload-large">
                Upload Your First Photo
              </button>
            </div>
          ) : (
            <div className="photos-grid">
              {photos.map((photo) => (
                <div key={photo.id} className="photo-card">
                  <img src={photo.fileUrl} alt={photo.filename} />
                  <p>{photo.filename}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="stats-section">
          <div className="stat-card">
            <h4>TOTAL PHOTOS</h4>
            <p className="stat-value">{photos.length}</p>
          </div>
          <div className="stat-card">
            <h4>ACCOUNT STATUS</h4>
            <p className="stat-value">Active</p>
          </div>
          <div className="stat-card">
            <h4>MEMBER SINCE</h4>
            <p className="stat-value">{new Date().getFullYear()}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
