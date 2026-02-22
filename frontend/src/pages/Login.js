import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    email: '', password: '', otp: '', role: 'customer', name: '', shopName: '', lat: null, lng: null 
  });
  const [locationStatus, setLocationStatus] = useState(null);

  // --- 1. HANDLE LOGIN (Email + Password) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', { 
            email: formData.email, 
            password: formData.password 
        });
        onLogin(res.data.user);
    } catch (err) {
        alert(err.response?.data?.error || "Login Failed");
    } finally { setLoading(false); }
  };

  // --- 2. HANDLE SIGNUP: Step A (Send Email OTP) ---
  const handleSignupRequest = async (e) => {
    e.preventDefault();
    if (!formData.email.includes('@')) return alert("Enter valid email");
    
    // Vendor Location Validation
    if (formData.role === 'vendor' && !formData.lat) return alert("⚠️ Please detect shop location!");

    setLoading(true);
    try {
        await axios.post('http://localhost:5000/api/auth/send-otp', { email: formData.email });
        alert(`📧 OTP sent to ${formData.email}`);
        setStep(2); 
    } catch (err) {
        alert(err.response?.data?.error || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  // --- 3. HANDLE SIGNUP: Step B (Verify OTP & Register) ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', formData);
        alert("✅ Account Created! Logged in.");
        onLogin(res.data.user);
    } catch (err) {
        alert("❌ Invalid OTP or Error");
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
    <div className="flex justify-center items-center h-[90vh] bg-gray-50 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
            {isLoginMode ? 'Login' : (step === 1 ? 'Create Account' : 'Verify Email')}
        </h2>

        {/* --- LOGIN FORM --- */}
        {isLoginMode && (
            <form onSubmit={handleLogin} className="space-y-4">
                <input 
                    type="email"
                    placeholder="Email Address" 
                    className="w-full p-3 border rounded-lg" 
                    onChange={e => setFormData({...formData, email: e.target.value})} required 
                />
                <input 
                    placeholder="Password" 
                    type="password" 
                    className="w-full p-3 border rounded-lg" 
                    onChange={e => setFormData({...formData, password: e.target.value})} required 
                />
                <button disabled={loading} className="w-full bg-black text-white p-3 rounded-lg font-bold hover:bg-gray-800 transition">
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <p className="text-center text-sm text-indigo-600 cursor-pointer hover:underline" onClick={() => setIsLoginMode(false)}>
                    New User? Create Account
                </p>
            </form>
        )}

        {/* --- SIGN UP FORM (Step 1) --- */}
        {!isLoginMode && step === 1 && (
            <form onSubmit={handleSignupRequest} className="space-y-4">
                <input placeholder="Full Name" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} required />
                
                <input 
                    placeholder="Set a Password" 
                    type="password" 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
                    onChange={e => setFormData({...formData, password: e.target.value})} required 
                />

                <select className="w-full p-3 border rounded-lg bg-white" onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="customer">I am a Customer</option>
                    <option value="vendor">I am a Service Center</option>
                </select>

                {formData.role === 'vendor' && (
                    <div className="bg-indigo-50 p-4 rounded-lg space-y-3">
                        <input placeholder="Shop Name" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, shopName: e.target.value})} required />
                        <button type="button" onClick={detectLocation} className={`w-full py-2 rounded font-bold text-sm ${locationStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-white border'}`}>
                            {locationStatus === 'success' ? '✅ Location Captured' : '📍 Detect Shop Location'}
                        </button>
                    </div>
                )}

                <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} required />
                
                <button disabled={loading} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition">
                    {loading ? 'Processing...' : 'Verify Email (Get OTP)'}
                </button>
                <p className="text-center text-sm text-gray-500 cursor-pointer hover:underline" onClick={() => setIsLoginMode(true)}>
                    Already have an account? Login
                </p>
            </form>
        )}

        {/* --- SIGN UP FORM (Step 2: OTP) --- */}
        {!isLoginMode && step === 2 && (
            <form onSubmit={handleRegister} className="space-y-4">
                <p className="text-center text-gray-500 text-sm">Enter the code sent to {formData.email}</p>
                <input placeholder="XXXXXX" className="w-full p-3 border rounded-lg text-center text-2xl tracking-widest" onChange={e => setFormData({...formData, otp: e.target.value})} required />
                <button disabled={loading} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition">
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
                <p className="text-center text-xs text-red-400 cursor-pointer hover:underline" onClick={() => setStep(1)}>
                    Incorrect Details? Go Back
                </p>
            </form>
        )}
      </div>
    </div>
  );
};
export default Login;