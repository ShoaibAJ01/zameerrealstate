import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, User as UserIcon, Users, Star, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, message: '' });
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);

  useEffect(() => {
    fetchUserProperties();
    checkFeedbackStatus();
    if (user?.role === 'admin') {
      fetchAllUsers();
    }
  }, [user]);

  const checkFeedbackStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userFeedback = response.data.find(f => f.user._id === user?._id);
      setHasSubmittedFeedback(!!userFeedback);
    } catch (error) {
      console.error('Error checking feedback:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserProperties = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties/user/my-properties`);
      setProperties(response.data);
      
      const totalViews = response.data.reduce((sum, prop) => sum + prop.views, 0);
      setStats({
        totalProperties: response.data.length,
        totalViews
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/properties/${id}`);
      fetchUserProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/feedback`,
        feedback,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Thank you for your feedback!');
      setShowFeedbackModal(false);
      setHasSubmittedFeedback(true);
      setFeedback({ rating: 5, message: '' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
            </div>
            {!hasSubmittedFeedback && (user?.role === 'user' || user?.role === 'agent') && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="hidden sm:inline">Share Feedback</span>
              </button>
            )}
          </div>
        </div>

        {/* Admin Section - Users & Agents */}
        {user?.role === 'admin' && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">All Users & Agents</h2>
                </div>
                <Link
                  to="/admin/properties"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Manage Properties
                </Link>
              </div>
              
              {/* Responsive Users Table */}
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Properties
                          </th>
                          <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allUsers.map((userItem) => (
                          <tr key={userItem._id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <UserIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                  {userItem.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 truncate max-w-[150px] sm:max-w-none">
                                {userItem.email}
                              </div>
                            </td>
                            <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                userItem.role === 'agent' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {userItem.role}
                              </span>
                            </td>
                            <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {userItem.propertiesPosted || 0}
                            </td>
                            <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {userItem.phone || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {allUsers.length === 0 && (
                <p className="text-center text-gray-500 py-4">No users found</p>
              )}
            </div>
          </div>
        )}

        {/* Stats Cards - Only for non-admin or simplified for admin */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Properties Posted</h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
              {user?.propertiesPosted || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Total Views</h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{stats.totalViews}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 col-span-2 lg:col-span-1">
            <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Account Type</h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Add Property Button */}
        <div className="mb-4 sm:mb-6">
          <Link
            to="/add-property"
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 inline-block text-sm sm:text-base"
          >
            Add New Property
          </Link>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Properties</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : properties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property._id}>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={property.images?.[0] || 'https://via.placeholder.com/100'}
                            alt={property.title}
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover flex-shrink-0"
                          />
                          <div className="ml-2 sm:ml-4 min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                              {property.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{property.address?.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-xs sm:text-sm text-gray-900 capitalize">{property.propertyType}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-xs sm:text-sm text-gray-900">${property.price.toLocaleString()}</span>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          property.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {property.views}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/property/${property._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(property._id)}
                            className="text-red-600 hover:text-red-900"
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
              <p>No properties yet. Add your first property!</p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Share Your Feedback</h3>
            <form onSubmit={handleSubmitFeedback}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= feedback.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Tell us about your experience..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {feedback.message.length}/500 characters
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!feedback.message.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
