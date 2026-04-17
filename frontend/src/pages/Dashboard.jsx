import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

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
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="app-title">🎭 FaceLens</h1>
          {user && (
            <div className="user-info">
              <span className="username">{user.username}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="dashboard-main">
        <section className="welcome-section">
          <h2>Welcome, {user?.firstName || user?.username}! 👋</h2>
          <p>Upload and analyze photos with face recognition</p>
        </section>

        <section className="photos-section">
          <div className="section-header">
            <h3>Your Photos</h3>
            <button onClick={handleUploadPhoto} className="btn-upload">
              + Upload Photo
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
            <h4>Total Photos</h4>
            <p className="stat-value">{photos.length}</p>
          </div>
          <div className="stat-card">
            <h4>Account Status</h4>
            <p className="stat-value">Active</p>
          </div>
          <div className="stat-card">
            <h4>Member Since</h4>
            <p className="stat-value">{new Date().getFullYear()}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
