import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Bed, Bath, Square, Phone, Mail, User } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    fetchProperty();
    fetchAdminInfo();
  }, [id]);

  const fetchAdminInfo = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/admin-info`);
      setAdminInfo(response.data);
    } catch (error) {
      console.error('Error fetching admin info:', error);
    }
  };

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Property not found</h2>
      </div>
    );
  }

  const images = property.images?.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'];

  // Convert sq ft to marla (1 marla = 272.25 sq ft)
  const areaInMarla = property.area ? (property.area / 272.25).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Image Gallery */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <img
              src={images[currentImage]}
              alt={property.title}
              className="w-full h-48 sm:h-64 md:h-96 object-cover rounded-lg"
            />
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      currentImage === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {images.slice(0, 4).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${property.title} ${index + 1}`}
                  onClick={() => setCurrentImage(index)}
                  className="w-full h-16 sm:h-20 md:h-24 object-cover rounded cursor-pointer hover:opacity-75"
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-start text-gray-600">
                    <MapPin className="h-5 w-5 mr-1 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{property.address?.street}, {property.address?.city}, {property.address?.country}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    ${property.price.toLocaleString()}
                  </div>
                  <span className="text-sm text-gray-500">
                    {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-4 border-y text-gray-700">
                <div className="flex items-center">
                  <Bed className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-sm sm:text-base">{property.bedrooms} Beds</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-sm sm:text-base">{property.bathrooms} Baths</span>
                </div>
                <div className="flex items-center">
                  <Square className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-sm sm:text-base">{property.area} sq ft ({areaInMarla} Marla)</span>
                </div>
              </div>

              {/* Dimensions & Facing */}
              {(property.width > 0 || property.height > 0 || property.facing) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-900">Property Details</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm sm:text-base">
                    {property.width > 0 && (
                      <div>
                        <span className="text-gray-500">Width:</span>
                        <span className="ml-2 font-semibold text-gray-900">{property.width} ft</span>
                      </div>
                    )}
                    {property.height > 0 && (
                      <div>
                        <span className="text-gray-500">Length:</span>
                        <span className="ml-2 font-semibold text-gray-900">{property.height} ft</span>
                      </div>
                    )}
                    {property.facing && (
                      <div>
                        <span className="text-gray-500">Facing:</span>
                        <span className="ml-2 font-semibold text-gray-900 capitalize">{property.facing.replace('-', ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{property.description}</p>
              </div>

              {property.features?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3">Features</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-700 text-sm sm:text-base">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 flex-shrink-0"></span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.amenities?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3">Amenities</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-gray-700 text-sm sm:text-base">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 flex-shrink-0"></span>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Tours */}
              {property.videos?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3">Video Tours</h2>
                  <div className="space-y-3">
                    {property.videos.map((video, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <iframe
                          src={video.includes('youtube') ? video.replace('watch?v=', 'embed/') : video}
                          className="w-full h-full"
                          allowFullScreen
                          title={`Video ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map */}
              <div className="mt-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3">Location</h2>
                <div className="h-64 sm:h-80 rounded-lg overflow-hidden">
                  <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    <Map
                      defaultCenter={{
                        lat: property.location?.coordinates?.[1] || 33.6844,
                        lng: property.location?.coordinates?.[0] || 73.0479
                      }}
                      defaultZoom={15}
                      mapId="property-detail-map"
                    >
                      <AdvancedMarker
                        position={{
                          lat: property.location?.coordinates?.[1] || 33.6844,
                          lng: property.location?.coordinates?.[0] || 73.0479
                        }}
                      >
                        <Pin background={'#3B82F6'} borderColor={'#1E40AF'} glyphColor={'#FFF'} />
                      </AdvancedMarker>
                    </Map>
                  </APIProvider>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Card - Always Show Admin Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-20">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Contact Information</h2>
              {adminInfo ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Contact Person</p>
                      <span className="text-sm sm:text-base text-gray-700 font-medium">{adminInfo.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <a href={`mailto:${adminInfo.email}`} className="text-sm sm:text-base text-blue-600 hover:underline break-all">
                        {adminInfo.email}
                      </a>
                    </div>
                  </div>
                  {adminInfo.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <a href={`tel:${adminInfo.phone}`} className="text-sm sm:text-base text-blue-600 hover:underline">
                          {adminInfo.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  <button className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 mt-4 text-sm sm:text-base transition-colors">
                    Contact Now
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500">Loading contact info...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
