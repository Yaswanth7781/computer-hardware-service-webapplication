import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CustomerHome from './pages/CustomerHome';
import VendorDashboard from './pages/VendorDashboard';

function App() {
  // Check local storage for existing session
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Navbar */}
        <nav className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛠️</span>
            <h1 className="text-xl font-bold tracking-wide">HardwareService</h1>
          </div>
          {user && (
            <div className="flex gap-4 items-center">
              <span className="hidden md:block font-medium">Hello, {user.name}</span>
              <button 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition shadow-md"
              >
                Logout
              </button>
            </div>
          )}
        </nav>

        {/* Routes */}
        <div className="container mx-auto">
          <Routes>
            <Route 
              path="/" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={user.role === 'customer' ? '/home' : '/dashboard'} />} 
            />
            <Route 
              path="/home" 
              element={user?.role === 'customer' ? <CustomerHome user={user} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/dashboard" 
              element={user?.role === 'vendor' ? <VendorDashboard user={user} /> : <Navigate to="/" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;