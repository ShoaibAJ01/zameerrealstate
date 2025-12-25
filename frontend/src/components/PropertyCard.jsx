import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart } from 'lucide-react';

const PropertyCard = ({ property }) => {
  // Convert sq ft to marla (1 marla = 272.25 sq ft)
  const areaInMarla = property.area ? (property.area / 272.25).toFixed(2) : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <div className="relative">
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'}
          alt={property.title}
          className="w-full h-40 sm:h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
            {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
        </div>
        <button className="absolute top-2 right-2 bg-white p-1.5 sm:p-2 rounded-full hover:bg-gray-100">
          <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
        </button>
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-2 truncate">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span className="text-xs sm:text-sm truncate">{property.address?.city}, {property.address?.country}</span>
        </div>

        <div className="flex items-center justify-between mb-3 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center">
              <Bed className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center">
              <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">{areaInMarla} Marla</span>
              <span className="sm:hidden">{areaInMarla}M</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t gap-2 sm:gap-0 mt-auto">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            ${property.price.toLocaleString()}
          </div>
          <Link
            to={`/property/${property._id}`}
            className="w-full sm:w-auto text-center bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 text-xs sm:text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
