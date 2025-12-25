import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Menu, X, User, LogOut, Building2, MessageCircle, LayoutDashboard, Users, Settings, Plus, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-2xl transform group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 text-transparent bg-clip-text">
                  RealEstate
                </span>
                <div className="flex items-center gap-1 -mt-1">
                  <Sparkles className="h-2 w-2 text-yellow-500" />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Premium</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              to="/" 
              className={`relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </span>
              {isActive('/') && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              )}
            </Link>

            <Link 
              to="/properties" 
              className={`relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/properties') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Properties
              </span>
              {isActive('/properties') && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              )}
            </Link>

            {user ? (
              <>
                {(user.role === 'agent' || user.role === 'admin') && (
                  <Link 
                    to="/dashboard" 
                    className={`relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                      isActive('/dashboard') 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </span>
                    {isActive('/dashboard') && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                    )}
                  </Link>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link 
                      to="/admin/properties" 
                      className={`relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        isActive('/admin/properties') 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Properties
                      </span>
                      {isActive('/admin/properties') && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                      )}
                    </Link>

                    <Link 
                      to="/admin/users" 
                      className={`relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        isActive('/admin/users') 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Users
                      </span>
                      {isActive('/admin/users') && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                      )}
                    </Link>

                    <Link 
                      to="/admin/chat" 
                      className={`relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        isActive('/admin/chat') 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Messages
                      </span>
                      {isActive('/admin/chat') && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                      )}
                    </Link>
                  </>
                )}

                {(user.role === 'agent' || user.role === 'admin') && (
                  <Link 
                    to="/add-property" 
                    className="relative ml-2 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Property
                    </div>
                  </Link>
                )}

                <div className="h-8 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize leading-tight">{user.role}</div>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-slate-600 hover:text-slate-900 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="relative ml-2 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    Get Started
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/50">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link 
              to="/" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                isActive('/') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-5 w-5" />
              Home
            </Link>

            <Link 
              to="/properties" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                isActive('/properties') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Building2 className="h-5 w-5" />
              Properties
            </Link>

            {user ? (
              <>
                {(user.role === 'agent' || user.role === 'admin') && (
                  <Link 
                    to="/dashboard" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      isActive('/dashboard') 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link 
                      to="/admin/properties" 
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                        isActive('/admin/properties') 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      Manage Properties
                    </Link>

                    <Link 
                      to="/admin/users" 
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                        isActive('/admin/users') 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Users className="h-5 w-5" />
                      Manage Users
                    </Link>

                    <Link 
                      to="/admin/chat" 
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                        isActive('/admin/chat') 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <MessageCircle className="h-5 w-5" />
                      Messages
                    </Link>
                  </>
                )}

                {(user.role === 'agent' || user.role === 'admin') && (
                  <Link 
                    to="/add-property" 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <Plus className="h-5 w-5" />
                    Add Property
                  </Link>
                )}

                <div className="pt-4 mt-4 border-t border-slate-200">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-sm text-slate-500 capitalize">{user.role}</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }} 
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <Sparkles className="h-5 w-5" />
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
