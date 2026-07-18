import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import WildlifeMap from '../components/WildlifeMap';
import AiChatSidebar from '../components/AiChatSidebar';
import './MapExplorer.css';

const MapExplorer = () => {
  const [allAvistamientos, setAllAvistamientos] = useState([]);
  const [filteredAvistamientos, setFilteredAvistamientos] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('Todos');
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchAvistamientos = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Avistamientos`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setAllAvistamientos(data);
        setFilteredAvistamientos(data);
      } catch (error) {
        console.error('Error fetching avistamientos:', error);
      }
    };

    fetchAvistamientos();
  }, []);

  const isMarino = (especie) => {
    if (!especie) return false;
    const nombre = (especie.nombreComun || '').toLowerCase();
    return especie.tipo === 'Pez' || 
           nombre.includes('ballena') || 
           nombre.includes('delfín') || 
           nombre.includes('tortuga') || 
           nombre.includes('mantarraya') ||
           nombre.includes('tiburón');
  };

  const handleFilter = (tipo) => {
    setCurrentFilter(tipo);
    if (tipo === 'Todos') {
      setFilteredAvistamientos(allAvistamientos);
    } else if (tipo === 'Marinos') {
      setFilteredAvistamientos(allAvistamientos.filter(a => isMarino(a.especie)));
    } else if (tipo === 'Terrestres') {
      setFilteredAvistamientos(allAvistamientos.filter(a => !isMarino(a.especie)));
    }
  };

  const handleAnimalFound = (response) => {
    if (!mapRef.current) return;
    
    // Attempt to find it in our database first
    const sighting = allAvistamientos.find(a => 
      a.especie && 
      response.animalName && 
      a.especie.nombreComun.toLowerCase().includes(response.animalName.toLowerCase())
    );

    if (sighting && sighting.coordenadas) {
      const lat = sighting.coordenadas.coordinates[1];
      const lng = sighting.coordenadas.coordinates[0];
      mapRef.current.flyToAsync(lng, lat);
    } else if (response.longitude !== null && response.latitude !== null) {
      // Animal not in DB, use AI dynamic marker
      const title = response.animalName || 'Animal desconocido';
      const desc = response.description || 'No hay descripción disponible.';
      const biome = response.biome || 'Desconocido';
      const fotoUrl = response.fotoUrl || '';
      mapRef.current.addDynamicMarkerAsync(response.longitude, response.latitude, title, desc, biome, fotoUrl);
    }
  };

  return (
    <div className="map-layout">
      {/* Top Navigation Bar */}
      <div className="map-topbar">
        <Link to="/" className="map-brand" title="Volver al inicio">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>WildLife</span>
        </Link>

        <div className="filter-pills">
          <button 
            className={`filter-btn ${currentFilter === 'Terrestres' ? 'active' : ''}`} 
            onClick={() => handleFilter('Terrestres')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
            </svg>
            Terrestres
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'Marinos' ? 'active' : ''}`} 
            onClick={() => handleFilter('Marinos')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h2a8 8 0 1 0 16 0h2"/>
              <path d="M2 12c2-2 4-3 6-3s4 1 6 3c2 2 4 3 6 3"/>
            </svg>
            Marinos
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'Todos' ? 'active' : ''}`} 
            onClick={() => handleFilter('Todos')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            Todos
          </button>
        </div>

        <div className="topbar-right">
          <div className="sighting-count">
            <span className="count-dot"></span>
            <span>{filteredAvistamientos.length} avistamientos</span>
          </div>
        </div>
      </div>

      {/* Map Component */}
      <WildlifeMap ref={mapRef} avistamientos={filteredAvistamientos} />

      {/* Chatbot Component */}
      <AiChatSidebar onAnimalFound={handleAnimalFound} />
    </div>
  );
};

export default MapExplorer;
