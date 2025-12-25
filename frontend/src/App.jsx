import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/AddProperty';
import Subscriptions from './pages/Subscriptions';
import AdminProperties from './pages/AdminProperties';
import AdminChat from './pages/AdminChat';
import UserManagement from './pages/UserManagement';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route 
              path="/property/:id" 
              element={
                <PrivateRoute>
                  <PropertyDetail />
                </PrivateRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-property"
              element={
                <PrivateRoute>
                  <AddProperty />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/properties"
              element={
                <PrivateRoute>
                  <AdminProperties />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/chat"
              element={
                <PrivateRoute>
                  <AdminChat />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute>
                  <UserManagement />
                </PrivateRoute>
              }
            />
          </Routes>
          <ChatWidget />
        </div>
      </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
