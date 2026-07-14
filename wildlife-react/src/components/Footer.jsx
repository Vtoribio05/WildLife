import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} WildLife Explorer. Todos los derechos reservados.</p>
        <div className="social-links">
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
          <a href="#">Facebook</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
