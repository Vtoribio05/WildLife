let map = null;
let markers = [];

export function initMap(elementId, accessToken) {
    console.log("initMap called! elementId:", elementId, "accessToken length:", accessToken ? accessToken.length : 0);
    
    if (map !== null) {
        console.log("Removing existing map instance...");
        map.remove();
    }
    
    mapboxgl.accessToken = accessToken;
    
    console.log("Initializing mapboxgl.Map...");
    map = new mapboxgl.Map({
        container: elementId,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-70.1627, 18.7357],
        zoom: 6,
        pitch: 50,
        bearing: -10,
        antialias: true,
        fadeDuration: 300
    });

    // Minimal navigation controls
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'bottom-left');

    // Add atmosphere and fog for a premium look
    map.on('style.load', () => {
        map.setFog({
            'color': 'rgb(10, 11, 13)',
            'high-color': 'rgb(20, 24, 35)',
            'horizon-blend': 0.08,
            'space-color': 'rgb(8, 10, 16)',
            'star-intensity': 0.6
        });
    });
}

let dynamicMarker = null;

function createPopupHTML(title, description, biome, lat, lng, fotoUrl, badge) {
    let finalFotoUrl = fotoUrl ? fotoUrl : `https://loremflickr.com/320/240/${encodeURIComponent(title)}`;
    
    return `
        <div class="wildlife-popup">
            <div class="popup-img-wrap">
                <img src="${finalFotoUrl}" alt="${title}" 
                     onerror="this.onerror=null; this.src='https://placehold.co/400x240/141518/f5c862?text=${encodeURIComponent(title)}';" />
                <div class="popup-img-overlay"></div>
            </div>
            <div class="popup-body">
                <div class="popup-title-row">
                    <h3>${title}</h3>
                </div>
                <div class="popup-badge-row">${badge}</div>
                <div class="popup-meta">
                    <div class="popup-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        <span>${biome || 'Desconocido'}</span>
                    </div>
                    <div class="popup-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
                    </div>
                </div>
                <p class="popup-desc">${description || 'Sin descripción disponible.'}</p>
            </div>
        </div>
    `;
}

export function addDynamicMarker(lng, lat, title, description, biome, fotoUrl) {
    if (map === null) return;
    
    if (dynamicMarker !== null) {
        dynamicMarker.remove();
    }
    
    // Custom glowing marker for AI suggestions
    const el = document.createElement('div');
    el.className = 'ai-marker';
    el.innerHTML = `
        <div class="ai-marker-ping"></div>
        <div class="ai-marker-dot"></div>
    `;

    let badge = `<span class="popup-tag popup-tag-ai">✨ Sugerencia IA</span>`;
    let popupContent = createPopupHTML(title, description, biome, lat, lng, fotoUrl, badge);
    
    dynamicMarker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: true, className: 'wildlife-popup-wrap', maxWidth: '320px' }).setHTML(popupContent))
        .addTo(map);
        
    map.flyTo({
        center: [lng, lat],
        zoom: 12,
        essential: true,
        pitch: 60,
        duration: 2500,
        curve: 1.5
    });

    // Open the popup automatically
    dynamicMarker.togglePopup();
}

export function addMarkers(sightings) {
    markers.forEach(m => m.remove());
    markers = [];

    sightings.forEach(s => {
        if(s.coordenadas && s.coordenadas.coordinates) {
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

            // Custom marker element
            const el = document.createElement('div');
            el.className = isMarino ? 'species-marker marine' : 'species-marker land';
            el.innerHTML = `<div class="marker-inner"></div>`;

            let especieNombre = s.especie ? s.especie.nombreComun : 'Desconocido';
            let fotoUrl = s.especie && s.especie.fotoUrl ? s.especie.fotoUrl : `https://loremflickr.com/320/240/${encodeURIComponent(especieNombre)}`;
            let descripcion = s.especie && s.especie.descripcion ? s.especie.descripcion : 'Sin descripción disponible.';
            let bioma = s.especie && s.especie.bioma ? s.especie.bioma : (s.especie ? s.especie.tipo : 'Desconocido');
            
            let badge;
            if (s.especie && s.especie.enPeligroExtincion) {
                badge = `<span class="popup-tag popup-tag-danger">En Peligro</span>`;
            } else {
                badge = `<span class="popup-tag popup-tag-safe">Preocupación Menor</span>`;
            }

            let popupContent = createPopupHTML(especieNombre, descripcion, bioma, lat, lng, fotoUrl, badge);

            let popup = new mapboxgl.Popup({ offset: 25, closeButton: true, className: 'wildlife-popup-wrap', maxWidth: '320px' })
                .setHTML(popupContent);

            let marker = new mapboxgl.Marker({ element: el })
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(map);

            markers.push(marker);
        }
    });
}

export function flyToLocation(lng, lat) {
    if(map) {
        map.flyTo({
            center: [lng, lat],
            zoom: 9,
            essential: true,
            duration: 2500,
            curve: 1.5
        });
    }
}
