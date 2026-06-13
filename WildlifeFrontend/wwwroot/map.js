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
        style: 'mapbox://styles/mapbox/satellite-v9', // Satellite map as requested
        center: [-70.1627, 18.7357], // DR roughly
        zoom: 6,
        pitch: 45 // 3D look
    });
    
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');
}
let dynamicMarker = null;

export function addDynamicMarker(lng, lat, title, description, biome, fotoUrl) {
    if (map === null) return;
    
    // Remove previous dynamic marker if it exists
    if (dynamicMarker !== null) {
        dynamicMarker.remove();
    }
    
    // Create a special colored marker for AI suggestions
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundColor = '#facc15'; // Yellow color for AI
    el.style.borderRadius = '50%';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 15px rgba(250, 204, 21, 0.8)';
    el.style.cursor = 'pointer';

    let finalFotoUrl = fotoUrl ? fotoUrl : `https://loremflickr.com/320/240/${encodeURIComponent(title)}`;
    let popupContent = `
        <div style="width: 280px; font-family: 'Inter', sans-serif; overflow: hidden; border-radius: 12px;">
            <img src="${finalFotoUrl}" alt="${title}" style="height: 160px; width: 100%; object-fit: contain; display: block; background-color: #1e293b;" onerror="this.onerror=null; this.src='https://placehold.co/400x300/1e293b/e5cd9e?text=Sin+Foto';"/>
            <div style="padding: 16px; background: rgba(15, 23, 42, 0.95); color: #f8fafc;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #facc15;">${title}</h3>
                </div>
                <div style="margin-bottom: 12px;"><span style="background: rgba(250, 204, 21, 0.2); color: #facc15; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; border: 1px solid rgba(250, 204, 21, 0.3);">✨ SUGERENCIA DE IA</span></div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 0.85rem; color: #94a3b8;">
                    <span>🌍</span> <span><strong>Bioma:</strong> ${biome || 'Desconocido'}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px; font-size: 0.85rem; color: #94a3b8;">
                    <span>📍</span> <span>${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
                </div>
                <p style="margin: 0; font-size: 0.9rem; line-height: 1.5; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
                    ${description || 'Sin descripción disponible.'}
                </p>
            </div>
        </div>
    `;
    
    dynamicMarker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false, className: 'dark-popup' }).setHTML(popupContent))
        .addTo(map);
        
    // Fly to the new marker
    map.flyTo({
        center: [lng, lat],
        zoom: 12,
        essential: true,
        pitch: 60
    });
}
export function addMarkers(sightings) {
    // Clear existing markers
    markers.forEach(m => m.remove());
    markers = [];

    sightings.forEach(s => {
        if(s.coordenadas && s.coordenadas.coordinates) {
            let lat = s.coordenadas.coordinates[1];
            let lng = s.coordenadas.coordinates[0];
            
            let color = '#10b981'; // Default Green (Terrestre)
            if (s.especie) {
                let nombre = (s.especie.nombreComun || '').toLowerCase();
                let isMarino = s.especie.tipo === 'Pez' || 
                               nombre.includes('ballena') || 
                               nombre.includes('delfín') || 
                               nombre.includes('tortuga') || 
                               nombre.includes('mantarraya') ||
                               nombre.includes('tiburón') ||
                               (s.especie.bioma && s.especie.bioma.toLowerCase().includes('océano'));
                
                if (isMarino) {
                    color = '#3b82f6'; // Blue (Marino)
                }
            }

            let especieNombre = s.especie ? s.especie.nombreComun : 'Desconocido';
            let fotoUrl = s.especie && s.especie.fotoUrl ? s.especie.fotoUrl : `https://loremflickr.com/320/240/${encodeURIComponent(especieNombre)}`;
            let descripcion = s.especie && s.especie.descripcion ? s.especie.descripcion : 'Sin descripción disponible.';
            let bioma = s.especie && s.especie.bioma ? s.especie.bioma : (s.especie ? s.especie.tipo : 'Desconocido');
            let peligro = s.especie && s.especie.enPeligroExtincion ? '<span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; border: 1px solid rgba(239, 68, 68, 0.3);">EN PELIGRO</span>' : '<span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; border: 1px solid rgba(16, 185, 129, 0.3);">PREOCUPACIÓN MENOR</span>';

            let popupContent = `
                <div style="width: 280px; font-family: 'Inter', sans-serif; overflow: hidden; border-radius: 12px;">
                    <img src="${fotoUrl}" alt="${especieNombre}" style="height: 160px; width: 100%; object-fit: contain; display: block; background-color: #1e293b;" onerror="this.onerror=null; this.src='https://placehold.co/400x300/1e293b/e5cd9e?text=Sin+Foto';"/>
                    <div style="padding: 16px; background: rgba(15, 23, 42, 0.95); color: #f8fafc;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #e5cd9e;">${especieNombre}</h3>
                        </div>
                        <div style="margin-bottom: 12px;">${peligro}</div>
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 0.85rem; color: #94a3b8;">
                            <span>🌍</span> <span><strong>Bioma:</strong> ${bioma}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px; font-size: 0.85rem; color: #94a3b8;">
                            <span>📍</span> <span>${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
                        </div>
                        <p style="margin: 0; font-size: 0.9rem; line-height: 1.5; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
                            ${descripcion}
                        </p>
                    </div>
                </div>
            `;

            let popup = new mapboxgl.Popup({ offset: 25, closeButton: false, className: 'dark-popup' })
                .setHTML(popupContent);

            let marker = new mapboxgl.Marker({ color: color })
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
            duration: 2500 // Mapbox takes duration in ms
        });
    }
}
