import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Home as HomeIcon, TrendingUp, Award, MapPin, Shield, Clock, CheckCircle, Star, Users, Sparkles, Building2, ArrowRight } from 'lucide-react';

const Home = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/feedback/random?count=6');
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Use default testimonials if API fails
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (role) => {
    const colors = {
      agent: 'bg-blue-100 text-blue-600',
      user: 'bg-green-100 text-green-600',
      admin: 'bg-purple-100 text-purple-600'
    };
    return colors[role] || colors.user;
  };

  const getRoleLabel = (role) => {
    const labels = {
      agent: 'Real Estate Agent',
      user: 'Property Buyer',
      admin: 'Platform Admin'
    };
    return labels[role] || 'User';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Modern Design */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium">Trusted by 1000+ Property Seekers</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
              Discover Your
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-pulse">
                Dream Home
              </span>
            </h1>

            <p className="text-xl sm:text-2xl mb-12 text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Experience the future of real estate with AI-powered search, virtual tours, and instant agent connect.
            </p>
            
            {/* Modern Search Bar */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center px-4 py-3 bg-slate-50 rounded-xl">
                    <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                    <input
                      type="text"
                      placeholder="City, neighborhood, or property type..."
                      className="flex-1 outline-none text-gray-800 text-base bg-transparent font-medium"
                    />
                  </div>
                  <Link
                    to="/properties"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Search className="h-5 w-5" />
                    <span>Search Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link
                to="/properties"
                className="group relative bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 text-lg flex items-center justify-center gap-3 min-w-[200px]"
              >
                <Building2 className="h-6 w-6 text-blue-600" />
                <span>Browse 1000+ Homes</span>
              </Link>
              <Link
                to="/register"
                className="group relative bg-transparent backdrop-blur-sm text-white px-10 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all border-2 border-white/30 hover:border-white/50 shadow-2xl hover:shadow-3xl transform hover:scale-105 text-lg flex items-center justify-center gap-3 min-w-[200px]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Verified Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Glassmorphism Style */}
      <div className="relative -mt-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center group cursor-pointer">
                <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-3 group-hover:scale-110 transition-transform">
                  1000+
                </div>
                <div className="text-slate-600 font-semibold">Premium Properties</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text mb-3 group-hover:scale-110 transition-transform">
                  500+
                </div>
                <div className="text-slate-600 font-semibold">Happy Clients</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-5xl font-black bg-gradient-to-r from-orange-600 to-red-600 text-transparent bg-clip-text mb-3 group-hover:scale-110 transition-transform">
                  50+
                </div>
                <div className="text-slate-600 font-semibold">Expert Agents</div>
              </div>
              <div className="text-center col-span-2 md:col-span-1 group cursor-pointer">
                <div className="text-5xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 text-transparent bg-clip-text mb-3 group-hover:scale-110 transition-transform">
                  4.9★
                </div>
                <div className="text-slate-600 font-semibold">Client Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Modern Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-6 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Why Choose Us</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Everything You Need in
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">One Platform</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Cutting-edge features designed to make your property search seamless and enjoyable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Feature Card 1 */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-blue-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">AI-Powered Search</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Find your perfect property with intelligent filters, smart recommendations, and instant results tailored to your preferences.
              </p>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-green-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">100% Verified</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Every property verified by experts. Complete transparency with authentic photos, documents, and pricing.
              </p>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-purple-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Expert Guidance</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Connect instantly with certified agents. Get professional advice, virtual tours, and personalized recommendations.
              </p>
            </div>
          </div>

          {/* Feature Card 4 */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-orange-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-100 to-red-100 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Instant Support</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                24/7 live chat support, real-time notifications, and immediate responses to all your queries.
              </p>
            </div>
          </div>

          {/* Feature Card 5 */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-red-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-100 to-pink-100 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Market Analytics</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Real-time market data, price trends, ROI calculators, and investment insights powered by AI.
              </p>
            </div>
          </div>

          {/* Feature Card 6 */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-indigo-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Seamless Process</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Digital documentation, secure payments, virtual signatures, and end-to-end transaction management.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section - Modern Design */}
      <div className="relative bg-gradient-to-b from-slate-50 to-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-50 rounded-full px-6 py-2 mb-6">
              <Star className="h-4 w-4 text-purple-600 fill-purple-600" />
              <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Testimonials</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6">
              Loved by <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">Thousands</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Real stories from real people who found their dream homes with us
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial._id} 
                  className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-purple-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    {[...Array(5 - testimonial.rating)].map((_, i) => (
                      <Star key={`empty-${i}`} className="h-5 w-5 text-slate-300" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-slate-700 mb-8 leading-relaxed text-base line-clamp-4 font-medium">
                    "{testimonial.message}"
                  </p>
                  
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getAvatarColor(testimonial.user.role)} shadow-md group-hover:scale-110 transition-transform`}>
                      <span className="font-bold text-lg">{getInitials(testimonial.user.name)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-base">{testimonial.user.name}</div>
                      <div className="text-sm text-slate-500 font-medium">{getRoleLabel(testimonial.user.role)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Default Testimonial 1 */}
              <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-blue-200">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-8 leading-relaxed font-medium">
                  "Found my dream home within a week! The platform is incredibly easy to use and the agents are very professional."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-blue-600 font-bold text-lg">JD</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">John Doe</div>
                    <div className="text-sm text-slate-500 font-medium">Homebuyer</div>
                  </div>
                </div>
              </div>

              {/* Default Testimonial 2 */}
              <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-green-200">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-8 leading-relaxed font-medium">
                  "As an agent, this platform has helped me connect with serious buyers and close deals faster than ever before."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-green-600 font-bold text-lg">SA</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Sarah Ahmed</div>
                    <div className="text-sm text-slate-500 font-medium">Real Estate Agent</div>
                  </div>
                </div>
              </div>

              {/* Default Testimonial 3 */}
              <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-purple-200">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-8 leading-relaxed font-medium">
                  "Excellent service! The market insights helped me make an informed investment decision. Highly recommended!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-purple-600 font-bold text-lg">MK</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Mike Khan</div>
                    <div className="text-sm text-slate-500 font-medium">Property Investor</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section - Ultra Modern */}
      <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20 sm:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-8 shadow-2xl animate-bounce">
              <Award className="h-10 w-10 text-white" />
            </div>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              Ready to Find Your
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
                Perfect Property?
              </span>
            </h2>

            <p className="text-xl sm:text-2xl mb-12 text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Join 1000+ happy property owners who discovered their dream homes. Your journey begins here.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link
                to="/register"
                className="group relative bg-white text-slate-900 px-12 py-6 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 text-lg flex items-center justify-center gap-3 min-w-[250px]"
              >
                <span>Start Free Today</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/properties"
                className="group relative bg-transparent backdrop-blur-sm text-white px-12 py-6 rounded-2xl font-bold hover:bg-white/10 transition-all border-2 border-white/30 hover:border-white/50 shadow-2xl hover:shadow-3xl transform hover:scale-105 text-lg flex items-center justify-center gap-3 min-w-[250px]"
              >
                <Building2 className="h-6 w-6" />
                <span>Browse Properties</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Free to Sign Up</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
