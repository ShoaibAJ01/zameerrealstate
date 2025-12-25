import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useNavigate } from 'react-router-dom';

const PropertyMap = ({ properties, center, zoom = 11 }) => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = React.useState(null);

  const mapCenter = center || { lat: 33.6844, lng: 73.0479 };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={mapCenter}
          defaultZoom={zoom}
          mapId="properties-map"
        >
          {properties?.map((property) => {
            const position = {
              lat: property.location?.coordinates?.[1] || 33.6844,
              lng: property.location?.coordinates?.[0] || 73.0479
            };

            return (
              <AdvancedMarker
                key={property._id}
                position={position}
                onClick={() => setSelectedProperty(property)}
              >
                <Pin
                  background={property.listingType === 'sale' ? '#3B82F6' : '#10B981'}
                  borderColor={'#1E40AF'}
                  glyphColor={'#FFF'}
                />
              </AdvancedMarker>
            );
          })}

          {selectedProperty && (
            <InfoWindow
              position={{
                lat: selectedProperty.location?.coordinates?.[1] || 33.6844,
                lng: selectedProperty.location?.coordinates?.[0] || 73.0479
              }}
              onCloseClick={() => setSelectedProperty(null)}
            >
              <div className="p-2">
                <img
                  src={selectedProperty.images?.[0] || 'https://via.placeholder.com/150'}
                  alt={selectedProperty.title}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-sm mb-1">{selectedProperty.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{selectedProperty.address?.city}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold text-sm">
                    ${selectedProperty.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => navigate(`/property/${selectedProperty._id}`)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

export default PropertyMap;
