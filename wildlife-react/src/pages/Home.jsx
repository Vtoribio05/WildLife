import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="landing-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section" id="inicio">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Plataforma de Conservación con IA
          </div>
          <h1 className="hero-title">
            Explorando la <span className="gradient-text">Vida Silvestre</span><br/>
            del Universo en Tiempo Real
          </h1>
          <p className="hero-subtitle">
            Monitorea avistamientos, explora ecosistemas y descubre especies con nuestra plataforma 
            impulsada por inteligencia artificial y datos geoespaciales.
          </p>
          <div className="hero-actions">
            <Link to="/mapa" className="btn-primary" id="btn-launch">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
              Lanzar Plataforma
            </Link>
            <a href="#funciones" className="btn-secondary" id="btn-features">
              Descubrir Más
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </a>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Especies Registradas</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Ecosistemas</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Monitoreo Activo</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section" id="funciones">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Funcionalidades</span>
            <h2 className="section-title">Herramientas Poderosas para la <span className="gradient-text">Conservación</span></h2>
            <p className="section-desc">
              Cada función fue diseñada para maximizar el impacto en la protección de la vida silvestre,
              combinando tecnología de vanguardia con datos científicos.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card feature-highlight">
              <div className="feature-icon-wrap">🌍</div>
              <h3>Mapas Interactivos en 3D</h3>
              <p>Explora el mundo con mapas satelitales de alta resolución. Visualiza avistamientos geolocalizados con marcadores interactivos y filtra por tipo de especie.</p>
              <div className="feature-tag">Mapbox GL</div>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrap">🤖</div>
              <h3>Asistente IA Inteligente</h3>
              <p>Pregúntale al chatbot sobre cualquier especie del planeta. Obtén información detallada, hábitat, estado de conservación y ubicación en el mapa al instante.</p>
              <div className="feature-tag">Gemini AI</div>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrap">📡</div>
              <h3>Base de Datos Geoespacial</h3>
              <p>Almacenamiento para consultas geoespaciales avanzadas. Cada avistamiento incluye coordenadas precisas y metadatos completos.</p>
              <div className="feature-tag">PostGIS</div>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon-wrap">📍</div>
              <h3>Rastreo de Avistamientos</h3>
              <p>Registra y visualiza avistamientos de fauna con ubicación exacta, fecha, especie y observaciones. Filtra por terrestres, marinos o todas las categorías.</p>
              <div className="feature-tag">Tiempo Real</div>
            </div>

            {/* Feature 5 */}
            <div className="feature-card">
              <div className="feature-icon-wrap">⚠️</div>
              <h3>Alertas de Conservación</h3>
              <p>Identifica especies en peligro de extinción y recibe información sobre su estado de conservación según la UICN. Datos actualizados con IA.</p>
              <div className="feature-tag">UICN</div>
            </div>

            {/* Feature 6 */}
            <div className="feature-card">
              <div className="feature-icon-wrap">⚙️</div>
              <h3>API REST Completa</h3>
              <p>Backend robusto con ASP.NET Core que expone endpoints RESTful documentados con Swagger. Integración sencilla con cualquier cliente o aplicación externa.</p>
              <div className="feature-tag">.NET 9</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISSION SECTION ===== */}
      <section className="mission-section" id="mision">
        <div className="section-container mission-content">
          <div className="mission-grid">
            <div className="mission-text">
              <span className="section-tag">Nuestra Misión</span>
              <h2 className="section-title">La tecnología al servicio de la <span className="gradient-text">naturaleza</span></h2>
              <p className="mission-desc">
                WildLife nace con la visión de que la tecnología puede ser una herramienta poderosa para proteger 
                la biodiversidad. Creemos que el acceso a información precisa y en tiempo real es 
                fundamental para tomar mejores decisiones de conservación.
              </p>
              <div className="mission-values">
                <div className="value-item">
                  <div className="value-icon">🔓</div>
                  <div>
                    <strong>Datos Abiertos</strong>
                    <span>Información accesible para investigadores, ONGs y ciudadanos comprometidos.</span>
                  </div>
                </div>
                <div className="value-item">
                  <div className="value-icon">🧠</div>
                  <div>
                    <strong>IA Responsable</strong>
                    <span>Inteligencia artificial entrenada con fuentes científicas verificadas.</span>
                  </div>
                </div>
                <div className="value-item">
                  <div className="value-icon">✨</div>
                  <div>
                    <strong>Impacto Real</strong>
                    <span>Cada avistamiento registrado contribuye al monitoreo global de especies.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-card">
            <h2>¿Listo para explorar la vida silvestre?</h2>
            <p>Accede al mapa interactivo y comienza a descubrir las especies que habitan nuestro planeta.</p>
            <Link to="/mapa" className="btn-primary btn-large" id="btn-cta-explore">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
              Comenzar Ahora
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
