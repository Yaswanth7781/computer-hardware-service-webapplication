import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://computer-hardware-service-webapplication-production.up.railway.app';

const VendorStore = ({ vendor, user, onBack }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the latest vendor details when the page loads
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when opening the page
    axios.get(`${API_URL}/api/vendor/${vendor._id}`)
      .then(res => {
        setServices(res.data.services || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [vendor._id]);

  const handleBooking = async (serviceName, price) => {
    if (window.confirm(`Are you sure you want to book ${serviceName} for ₹${price}?`)) {
      try {
        await axios.post(`${API_URL}/api/orders`, { 
            customerId: user._id, 
            vendorId: vendor._id, 
            serviceName, 
            amount: price 
        });
        alert("🎉 Order Placed Successfully! The vendor has been notified.");
        onBack(); // Send them back to the map after successful booking
      } catch (err) { 
          alert("Booking failed. Please try again."); 
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      {/* 🔙 TOP NAVIGATION BAR */}
      <div className="bg-white px-6 py-4 shadow-sm flex items-center gap-4 sticky top-0 z-50">
        <button 
          onClick={onBack}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-800">Back to Map</h1>
      </div>

      {/* 🏪 VENDOR HERO BANNER */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white px-6 py-12 md:py-16 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-500/30 text-indigo-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-400/30">
                        Verified Service Center
                    </span>
                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                        {vendor.distance} km away
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-2">{vendor.shopName}</h1>
                <p className="text-indigo-200 font-medium flex items-center gap-2">
                    📍 Located near your selected area
                </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center">
                <p className="text-3xl font-black">{services.length}</p>
                <p className="text-sm font-semibold text-indigo-200">Services Offered</p>
            </div>
        </div>
      </div>

      {/* 🛠️ SERVICES GRID */}
      <div className="max-w-4xl mx-auto px-6 mt-10">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Available Services</h2>
        
        {loading ? (
            <div className="text-center py-12 text-indigo-600 font-bold animate-pulse">Loading services...</div>
        ) : services.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
                <span className="text-5xl mb-4 block opacity-50">🧰</span>
                <p className="text-gray-500 font-medium text-lg">This vendor hasn't listed any services yet.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-xl text-gray-800 mb-1 group-hover:text-indigo-700 transition-colors">{s.name}</h3>
                            <p className="text-gray-500 text-sm font-medium mb-4">Professional hardware service and repair.</p>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                            <span className="font-black text-2xl text-indigo-600">₹{s.price}</span>
                            <button 
                                onClick={() => handleBooking(s.name, s.price)} 
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-transform transform active:scale-95 shadow-sm"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default VendorStore;
