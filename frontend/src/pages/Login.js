import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://computer-hardware-service-webapplication-production.up.railway.app';

const Login = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    email: '', password: '', role: 'customer', name: '', shopName: '', lat: null, lng: null 
  });
  const [locationStatus, setLocationStatus] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await axios.post(`${API_URL}/api/auth/login`, { 
            email: formData.email, 
            password: formData.password 
        });
        onLogin(res.data.user);
    } catch (err) {
        alert(err.response?.data?.error || "Login Failed");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.email.includes('@')) return alert("Enter valid email");
    if (formData.role === 'vendor' && !formData.lat) return alert("⚠️ Please detect shop location!");

    setLoading(true);
    try {
        const res = await axios.post(`${API_URL}/api/auth/register`, formData);
        alert("✅ Account Created Successfully!");
        onLogin(res.data.user);
    } catch (err) {
        alert(err.response?.data?.error || "Registration Failed");
    } finally { setLoading(false); }
  };

  const detectLocation = () => {
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({ ...formData, lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('success');
      },
      () => setLocationStatus('error')
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-600 font-sans p-4">
      
      {/* Decorative blurred circles behind the card */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl w-full max-w-lg border border-white/20">
        
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                HardwareHub
            </h1>
            <p className="text-gray-500 font-medium">
                {isLoginMode ? 'Welcome back! Please login to your account.' : 'Join the smartest hardware network.'}
            </p>
        </div>

        <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-5">
            
            {!isLoginMode && (
                <input 
                    placeholder="Full Name" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                    onChange={e => setFormData({...formData, name: e.target.value})} required 
                />
            )}
            
            <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                onChange={e => setFormData({...formData, email: e.target.value})} required 
            />

            <input 
                placeholder="Password" 
                type="password" 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                onChange={e => setFormData({...formData, password: e.target.value})} required 
            />

            {!isLoginMode && (
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Account Type</label>
                    <select 
                        className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer" 
                        onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                        <option value="customer">Customer (Find Services)</option>
                        <option value="vendor">Service Center (Provide Services)</option>
                    </select>
                </div>
            )}

            {/* VENDOR ONLY FIELDS */}
            {!isLoginMode && formData.role === 'vendor' && (
                <div className="bg-indigo-50/50 p-5 rounded-2xl space-y-4 border border-indigo-100">
                    <input 
                        placeholder="Shop / Center Name" 
                        className="w-full p-4 bg-white border border-indigo-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                        onChange={e => setFormData({...formData, shopName: e.target.value})} required 
                    />
                    <button 
                        type="button" 
                        onClick={detectLocation} 
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm
                        ${locationStatus === 'success' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'}`}
                    >
                        {locationStatus === 'success' ? '✅ Location Captured' : '📍 Detect Shop Location (Required)'}
                    </button>
                </div>
            )}
            
            <button 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl font-bold text-lg hover:shadow-lg hover:opacity-90 transition-all transform active:scale-[0.98] mt-4"
            >
                {loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account')}
            </button>
            
            <div className="text-center mt-6">
                <button 
                    type="button"
                    className="text-sm font-semibold text-indigo-600 hover:text-purple-600 hover:underline transition-all" 
                    onClick={() => setIsLoginMode(!isLoginMode)}
                >
                    {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
export default Login;
