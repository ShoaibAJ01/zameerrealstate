import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';

const AdminProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllProperties();
    }
  }, [user]);

  const fetchAllProperties = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties/admin/all`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/properties/${propertyId}/status`, {
        status: newStatus
      });
      fetchAllProperties();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update property status');
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/properties/${propertyId}`);
      fetchAllProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const filteredProperties = properties.filter(prop => {
    if (filter === 'all') return true;
    return prop.status === filter;
  });

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mt-2">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage All Properties</h1>
          <p className="text-gray-600 mt-2">View and manage properties from all agents and users</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            All ({properties.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
              filter === 'available' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Available ({properties.filter(p => p.status === 'available').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
              filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Pending ({properties.filter(p => p.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('sold')}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
              filter === 'sold' ? 'bg-gray-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Sold/Rented ({properties.filter(p => p.status === 'sold' || p.status === 'rented').length})
          </button>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Property
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Owner
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property._id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={property.images?.[0] || 'https://via.placeholder.com/100'}
                            alt={property.title}
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover flex-shrink-0"
                          />
                          <div className="ml-2 sm:ml-4 min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[150px]">
                              {property.title}
                            </div>
                            <div className="text-xs text-gray-500">{property.address?.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{property.owner?.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{property.owner?.role}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-xs sm:text-sm text-gray-900">${property.price.toLocaleString()}</span>
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <select
                          value={property.status}
                          onChange={(e) => handleStatusChange(property._id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            property.status === 'available' ? 'bg-green-100 text-green-800' :
                            property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="available">Available</option>
                          <option value="pending">Pending</option>
                          <option value="sold">Sold</option>
                          <option value="rented">Rented</option>
                        </select>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/property/${property._id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(property._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No properties found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProperties;
