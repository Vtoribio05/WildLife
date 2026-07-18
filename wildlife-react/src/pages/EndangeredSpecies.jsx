import { useState, useEffect, useRef } from 'react';
import './EndangeredSpecies.css';

const EndangeredSpecies = () => {
  const [species, setSpecies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const fetchEndangeredSpecies = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Especies`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setSpecies(data);
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

  return (
    <div className="endangered-container theme-normal">
      <div className="endangered-header">
        <h1 className="gradient-text">Portal de Conservación UICN</h1>
        <p>Base de datos holográfica de especies en peligro.</p>
        
        <div className="command-stats">
          <div className="stat-box">
            <span className="stat-label">TOTAL DE ESPECIES</span>
            <span className="stat-value">{isLoading ? '...' : species.length}</span>
          </div>
        </div>
      </div>

      <div className="hud-layout">
        
        {/* Left Side: Radar List */}
        <div className="radar-panel">
          <div className="panel-header">
            <span className="live-dot"></span> 
            ESPECIES IDENTIFICADAS
          </div>
          
          <div className="radar-list">
            {isLoading ? (
              <div className="scanning-text">Cargando base de datos...</div>
            ) : species.length === 0 ? (
              <div className="scanning-text">No hay especies registradas.</div>
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
            ANÁLISIS BIOLÓGICO
          </div>
          
          <div className="scanner-display">
            {!selectedSpecies && !isScanning ? (
              <div className="idle-state">
                <div className="idle-icon">📡</div>
                <p>SELECCIONA UNA ESPECIE PARA APRENDER MÁS...</p>
              </div>
            ) : isScanning ? (
              <div className="scanning-state">
                <div className="scan-line"></div>
                <p>ANALIZANDO DATOS ECOLÓGICOS...</p>
              </div>
            ) : selectedSpecies ? (
              <div className="hologram-card">
                <div className="holo-image-wrap">
                  {selectedSpecies.fotoUrl ? (
                    <img src={selectedSpecies.fotoUrl} alt={selectedSpecies.nombreComun} className="holo-img" />
                  ) : (
                    <div className="holo-placeholder">SIN IMAGEN DISPONIBLE</div>
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
                    <div className={`metric ${selectedSpecies.enPeligroExtincion ? 'alert-metric' : 'safe-metric'}`}>
                      <span className="metric-label">Estado:</span>
                      <span className="metric-val">
                        {selectedSpecies.enPeligroExtincion ? 'EN PELIGRO' : 'PREOCUPACIÓN MENOR'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="holo-desc type-writer">
                    {selectedSpecies.descripcion || 'No hay datos biológicos registrados en la base de datos central.'}
                  </div>
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
