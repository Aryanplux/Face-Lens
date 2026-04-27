import { Link, useLocation } from 'react-router-dom';

export default function GlobalLogo() {
  const location = useLocation();
  if (location.pathname === '/') return null;

  return (
    <Link to="/" className="global-logo-container">
      <img src="/FaceLens.svg" alt="FaceLens" className="global-logo-img" />
      <span className="global-brand-name">FaceLens</span>
    </Link>
  );
}