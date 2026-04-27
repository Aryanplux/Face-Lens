import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import Landing from './pages/Landing';
import CreateEvent from './pages/CreateEvent';
import EventLogin from './pages/EventLogin';
import EventGallery from './pages/EventGallery';
import GlobalLogo from './components/GlobalLogo';
import GlobalThemeToggle from './components/GlobalThemeToggle';
import './App.css';
import './index.css';

function App() {
  const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <GlobalLogo />
      <GlobalThemeToggle />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <UploadPage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Landing />} />
        <Route path="/events/create" element={<CreateEvent />} />
        <Route path="/events/login" element={<EventLogin />} />
        <Route path="/events/:eventName" element={<EventGallery />} />
      </Routes>
    </Router>
  );
}

export default App;
