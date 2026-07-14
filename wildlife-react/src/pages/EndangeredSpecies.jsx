import { useState, useEffect, useRef } from 'react';
import './EndangeredSpecies.css';

const EndangeredSpecies = () => {
  const [species, setSpecies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertMode, setIsAlertMode] = useState(false);
  const [rescues, setRescues] = useState(0);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const typeWriterRef = useRef(null);

  useEffect(() => {
    const fetchEndangeredSpecies = async () => {
      try {
        const response = await fetch('http://localhost:5085/api/Especies');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        const endangered = data.filter(s => s.enPeligroExtincion === true);
        setSpecies(endangered);
      } catch (error) {
        console.error('Error fetching species:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEndangeredSpecies();
  }, []);

  const handleSelectSpecies = (s) => {
    if (selectedSpecies?.id === s.id) return;
    
    setIsScanning(true);
    setSelectedSpecies(null); // Reset to trigger scan animation
    
    setTimeout(() => {
      setSelectedSpecies(s);
      setIsScanning(false);
    }, 1500); // Scan duration
  };

  const incrementRescue = () => {
    setRescues(prev => prev + 1);
    setIsAlertMode(true);
    
    // Auto-disable tactical alert after 3 seconds
    setTimeout(() => {
      setIsAlertMode(false);
    }, 3000);
  };

  return (
    <div className={`endangered-container ${isAlertMode ? 'theme-alert' : 'theme-normal'}`}>
      <div className="endangered-header">
        <h1 className="gradient-text">Centro de Comando UICN</h1>
        <p>Sistema de Escaneo Holográfico y Operaciones de Rescate.</p>
        
        <div className="command-stats">
          <div className="stat-box">
            <span className="stat-label">ESPECIES CRÍTICAS</span>
            <span className="stat-value">{isLoading ? '...' : species.length}</span>
          </div>
          <div className="stat-box rescue-box">
            <span className="stat-label">RESCATES ACTIVOS</span>
            <span className="stat-value">{rescues}</span>
          </div>
        </div>
      </div>

      <div className="hud-layout">
        
        {/* Left Side: Radar List */}
        <div className="radar-panel">
          <div className="panel-header">
            <span className="live-dot"></span> 
            OBJETIVOS EN RIESGO
          </div>
          
          <div className="radar-list">
            {isLoading ? (
              <div className="scanning-text">Inicializando sensores geoespaciales...</div>
            ) : species.length === 0 ? (
              <div className="scanning-text">No hay objetivos detectados.</div>
            ) : (
              species.map(s => (
                <button 
                  key={s.id} 
                  className={`radar-item ${selectedSpecies?.id === s.id ? 'active' : ''}`}
                  onClick={() => handleSelectSpecies(s)}
                >
                  <div className="radar-blip"></div>
                  <div className="radar-info">
                    <div className="radar-name">{s.nombreComun}</div>
                    <div className="radar-type">{s.tipo}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Holographic Scanner */}
        <div className="scanner-panel">
          <div className="panel-header scanner-header">
            ANÁLISIS BIOMÉTRICO
          </div>
          
          <div className="scanner-display">
            {!selectedSpecies && !isScanning ? (
              <div className="idle-state">
                <div className="idle-icon">📡</div>
                <p>ESPERANDO SELECCIÓN DE OBJETIVO...</p>
              </div>
            ) : isScanning ? (
              <div className="scanning-state">
                <div className="scan-line"></div>
                <p>ANALIZANDO ADN Y FIRMA ECOLÓGICA...</p>
              </div>
            ) : selectedSpecies ? (
              <div className="hologram-card">
                <div className="holo-image-wrap">
                  {selectedSpecies.fotoUrl ? (
                    <img src={selectedSpecies.fotoUrl} alt={selectedSpecies.nombreComun} className="holo-img" />
                  ) : (
                    <div className="holo-placeholder">SIN IMAGEN SATELITAL</div>
                  )}
                  <div className="holo-overlay"></div>
                </div>
                
                <div className="holo-data">
                  <h2 className="holo-title">{selectedSpecies.nombreComun}</h2>
                  <h4 className="holo-scientific">[{selectedSpecies.nombreCientifico || 'Desconocido'}]</h4>
                  
                  <div className="holo-metrics">
                    <div className="metric">
                      <span className="metric-label">Bioma Base:</span>
                      <span className="metric-val">{selectedSpecies.bioma || 'Múltiple'}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Clasificación:</span>
                      <span className="metric-val">{selectedSpecies.tipo}</span>
                    </div>
                    <div className="metric alert-metric">
                      <span className="metric-label">Estado:</span>
                      <span className="metric-val">PELIGRO CRÍTICO</span>
                    </div>
                  </div>
                  
                  <div className="holo-desc type-writer">
                    {selectedSpecies.descripcion || 'No hay datos biológicos registrados en la base de datos central.'}
                  </div>
                  
                  <button className="btn-tactical" onClick={incrementRescue}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    INICIAR OPERACIÓN DE RESCATE
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndangeredSpecies;
