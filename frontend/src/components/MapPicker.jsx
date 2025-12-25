import React, { useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

const MapPicker = ({ onLocationSelect, initialLocation }) => {
  const [markerPosition, setMarkerPosition] = useState(
    initialLocation || { lat: 33.6844, lng: 73.0479 } // Islamabad default
  );

  const handleMapClick = useCallback((event) => {
    const lat = event.detail.latLng.lat;
    const lng = event.detail.latLng.lng;
    setMarkerPosition({ lat, lng });
    
    if (onLocationSelect) {
      onLocationSelect({ lat, lng });
    }
  }, [onLocationSelect]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={markerPosition}
          defaultZoom={12}
          mapId="realestate-map"
          onClick={handleMapClick}
        >
          <AdvancedMarker position={markerPosition}>
            <Pin background={'#3B82F6'} borderColor={'#1E40AF'} glyphColor={'#FFF'} />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
};

export default MapPicker;
