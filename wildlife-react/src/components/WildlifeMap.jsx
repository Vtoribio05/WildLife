import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './WildlifeMap.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const WildlifeMap = forwardRef(({ avistamientos, weatherMode = false, showPrecipitation = false }, ref) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const dynamicMarkerRef = useRef(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-70.1627, 18.7357],
      zoom: 6,
      pitch: 50,
      bearing: -10,
      antialias: true,
      fadeDuration: 300
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'bottom-left');

    map.current.on('style.load', () => {
      map.current.setFog({
        'color': 'rgb(10, 11, 13)',
        'high-color': 'rgb(20, 24, 35)',
        'horizon-blend': 0.08,
        'space-color': 'rgb(8, 10, 16)',
        'star-intensity': 0.6
      });

      if (showPrecipitation) {
        // Add RainViewer layer
        map.current.addSource('rainviewer', {
          type: 'raster',
          tiles: [
            'https://tilecache.rainviewer.com/v2/radar/1690000000/256/{z}/{x}/{y}/2/1_1.png'
          ],
          tileSize: 256
        });
        map.current.addLayer({
          id: 'rainviewer-layer',
          type: 'raster',
          source: 'rainviewer',
          paint: {
            'raster-opacity': 0.6
          }
        });
      }
    });
  }, [showPrecipitation]);

  // Sync markers when avistamientos change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!avistamientos || avistamientos.length === 0) return;

    avistamientos.forEach(s => {
      if (s.coordenadas && s.coordenadas.coordinates) {
        let lat = s.coordenadas.coordinates[1];
        let lng = s.coordenadas.coordinates[0];
        
        let isMarino = false;
        if (s.especie) {
          let nombre = (s.especie.nombreComun || '').toLowerCase();
          isMarino = s.especie.tipo === 'Pez' || 
                         nombre.includes('ballena') || 
                         nombre.includes('delfín') || 
                         nombre.includes('tortuga') || 
                         nombre.includes('mantarraya') ||
                         nombre.includes('tiburón') ||
                         (s.especie.bioma && s.especie.bioma.toLowerCase().includes('océano'));
        }

        const el = document.createElement('div');
        el.className = isMarino ? 'species-marker marine' : 'species-marker land';
        el.innerHTML = `<div class="marker-inner"></div>`;

        let especieNombre = s.especie ? s.especie.nombreComun : 'Desconocido';
        let fotoUrl = s.especie && s.especie.fotoUrl ? s.especie.fotoUrl : `https://loremflickr.com/320/240/${encodeURIComponent(especieNombre)}`;
        let descripcion = s.especie && s.especie.descripcion ? s.especie.descripcion : 'Sin descripción disponible.';
        let bioma = s.especie && s.especie.bioma ? s.especie.bioma : (s.especie ? s.especie.tipo : 'Desconocido');
        
        let badge = s.especie && s.especie.enPeligroExtincion 
          ? `<span class="popup-tag popup-tag-danger">En Peligro</span>` 
          : `<span class="popup-tag popup-tag-safe">Preocupación Menor</span>`;

        let popupContent = '';

        if (weatherMode) {
          // In Weather Mode, show Biome, Weather icon, and simulated weather data
          let tempC = s.weatherTemp || Math.floor(Math.random() * (45 - (-5) + 1)) - 5;
          let tempF = 32 + Math.floor(tempC / 0.5556);
          let summary = s.weatherSummary || "Despejado";
          let dateStr = s.fecha ? new Date(s.fecha).toLocaleDateString() : 'Desconocido';

          el.className = 'species-marker weather-marker';
          el.innerHTML = `<div class="marker-inner" style="background:#4ade80;"></div>`;

          popupContent = `
            <div class="wildlife-popup weather-popup">
              <div class="popup-body">
                <h3>Reporte Meteorológico</h3>
                <div class="popup-badge-row">
                  <span class="popup-tag" style="background:rgba(245,200,98,0.2);color:#f5c862;">${bioma}</span>
                </div>
                <div style="font-size: 2.5rem; color:#f5c862; font-weight:800; margin:10px 0; text-shadow:0 0 10px rgba(245,200,98,0.5);">
                  ${tempC}°C
                </div>
                <p style="font-size:1.1rem; color:#e2e8f0; margin-bottom:5px;">${summary}</p>
                <p style="color:#94a3b8; font-size:0.85rem;">Avistamiento: ${dateStr}</p>
                <p style="color:#94a3b8; font-size:0.85rem;">Fahrenheit: ${tempF}°F</p>
              </div>
            </div>
          `;
        } else {
          // Normal Mode
          popupContent = `
            <div class="wildlife-popup">
              <div class="popup-img-wrap">
                <img src="${fotoUrl}" alt="${especieNombre}" onerror="this.onerror=null; this.src='https://placehold.co/400x240/141518/f5c862?text=${encodeURIComponent(especieNombre)}';" />
              </div>
              <div class="popup-body">
                <h3>${especieNombre}</h3>
                <div class="popup-badge-row">${badge}</div>
                <p>Bioma: ${bioma}</p>
                <p>${descripcion}</p>
              </div>
            </div>
          `;
        }

        let marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: true, className: 'wildlife-popup-wrap', maxWidth: '320px' }).setHTML(popupContent))
          .addTo(map.current);

        markersRef.current.push(marker);
      }
    });
  }, [avistamientos, weatherMode]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    flyToAsync: (lng, lat) => {
      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: 12,
          essential: true,
          pitch: 60,
          duration: 2500,
          curve: 1.5
        });
      }
    },
    addDynamicMarkerAsync: (lng, lat, title, description, biome, fotoUrl) => {
      if (!map.current) return;

      if (dynamicMarkerRef.current) {
        dynamicMarkerRef.current.remove();
      }

      const el = document.createElement('div');
      el.className = 'ai-marker';
      el.innerHTML = `<div class="ai-marker-ping"></div><div class="ai-marker-dot"></div>`;

      let badge = `<span class="popup-tag popup-tag-ai">✨ Sugerencia IA</span>`;
      let finalFotoUrl = fotoUrl ? fotoUrl : `https://loremflickr.com/320/240/${encodeURIComponent(title)}`;
      let popupContent = `
        <div class="wildlife-popup">
            <div class="popup-img-wrap">
              <img src="${finalFotoUrl}" alt="${title}" onerror="this.onerror=null; this.src='https://placehold.co/400x240/141518/f5c862?text=${encodeURIComponent(title)}';" />
            </div>
            <div class="popup-body">
              <h3>${title}</h3>
              <div class="popup-badge-row">${badge}</div>
              <p>Bioma: ${biome || 'Desconocido'}</p>
              <p>${description || 'Sin descripción disponible.'}</p>
            </div>
        </div>
      `;

      dynamicMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: true, className: 'wildlife-popup-wrap', maxWidth: '320px' }).setHTML(popupContent))
        .addTo(map.current);

      map.current.flyTo({
        center: [lng, lat],
        zoom: 12,
        essential: true,
        pitch: 60,
        duration: 2500,
        curve: 1.5
      });

      dynamicMarkerRef.current.togglePopup();
    }
  }));

  return <div ref={mapContainer} className="map-container" />;
});

export default WildlifeMap;
