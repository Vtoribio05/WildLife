import { useState, useEffect, useRef } from 'react';
import WildlifeMap from '../components/WildlifeMap';
import './WeatherStation.css';

// Child Component using props and children
const WeatherCard = ({ title, subtitle, tempC, summary, showAdvanced, children }) => {
  const tempF = 32 + Math.floor(tempC / 0.5556);
  
  return (
    <div className="weather-card">
      <div className="weather-date">{title}</div>
      <div className="weather-temp">
        <span className="temp-c">{tempC}°C</span>
        <span className="weather-summary">{summary}</span>
      </div>
      <div className="weather-subtitle" style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem'}}>
        {subtitle}
      </div>
      
      {showAdvanced && (
        <div className="weather-advanced">
          <div className="advanced-item">
            <span className="label">Fahrenheit:</span>
            <span className="value">{tempF}°F</span>
          </div>
          {children}
        </div>
      )}
    </div>
  );
};

const WeatherStation = () => {
  const [avistamientos, setAvistamientos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [daysMonitored, setDaysMonitored] = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch avistamientos for the map and forecast
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Avistamientos`);
        if (response.ok) {
          const data = await response.json();
          
          const summaries = ["Despejado", "Nublado", "Lluvia Ligera", "Tormenta", "Vientos Fuertes", "Bruma", "Soleado"];
          
          // Attach random weather data to each avistamiento so it syncs with Map and Cards
          const dataWithWeather = data.map(s => ({
            ...s,
            weatherTemp: Math.floor(Math.random() * (45 - (-5) + 1)) - 5,
            weatherSummary: summaries[Math.floor(Math.random() * summaries.length)]
          }));

          setAvistamientos(dataWithWeather);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleAdvanced = () => setShowAdvanced(!showAdvanced);
  const addMonitoredDay = () => setDaysMonitored(prev => prev + 1);

  return (
    <div className="weather-container">
      <div className="weather-header">
        <h1 className="gradient-text">Centro Geometeorológico</h1>
        <p>Monitoreo climático y radar de precipitaciones por avistamiento.</p>
        
        <div className="weather-controls">
          <button className="btn-weather" onClick={toggleAdvanced}>
            {showAdvanced ? 'Ocultar Detalles Avanzados' : 'Mostrar Detalles Avanzados'}
          </button>
          <button className="btn-weather btn-monitor" onClick={addMonitoredDay}>
            Registrar Día de Monitoreo ({daysMonitored})
          </button>
        </div>
      </div>

      <div className="weather-dashboard">
        {/* Interactive Map Section */}
        <div className="weather-map-section">
          <div className="map-frame">
            <WildlifeMap 
              ref={mapRef} 
              avistamientos={avistamientos} 
              showPrecipitation={true} 
              weatherMode={true} 
            />
          </div>
          <div className="map-overlay-info">
            <span className="live-dot" style={{background: '#3b82f6', boxShadow: '0 0 8px #3b82f6'}}></span> 
            Radar de Precipitaciones Activo
          </div>
        </div>

        {/* Forecast Section */}
        <div className="weather-forecast-section">
          <h2 className="forecast-title">Reporte Climático por Avistamiento</h2>
          {isLoading ? (
            <div className="weather-loading">Sincronizando satélites meteorológicos...</div>
          ) : avistamientos.length === 0 ? (
            <div className="weather-loading" style={{color: '#94a3b8', fontStyle: 'normal'}}>No hay avistamientos registrados en la base de datos.</div>
          ) : (
            <div className="weather-grid">
              {avistamientos.map(s => (
                <WeatherCard 
                  key={s.id}
                  title={s.especie ? s.especie.nombreComun : 'Avistamiento Desconocido'}
                  subtitle={`${new Date(s.fecha).toLocaleDateString()} - Bioma: ${s.especie?.bioma || 'Múltiple'}`}
                  tempC={s.weatherTemp}
                  summary={s.weatherSummary}
                  showAdvanced={showAdvanced}
                >
                  <div className="advanced-item">
                    <span className="label">Presión Atm.:</span>
                    <span className="value">{Math.floor(Math.random() * 50 + 980)} hPa</span>
                  </div>
                  <div className="advanced-item">
                    <span className="label">Humedad:</span>
                    <span className="value">{Math.floor(Math.random() * 60 + 40)}%</span>
                  </div>
                </WeatherCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherStation;
