import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          🌿 WildLife
        </Link>
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/mapa">Mapa 3D</Link></li>
            <li><Link to="/endangered">Especies en Peligro</Link></li>
            <li><Link to="/weather">Clima</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
