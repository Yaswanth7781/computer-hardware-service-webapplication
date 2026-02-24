import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🛑 Variable declarations MUST come after all imports
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const userIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const vendorIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

const CustomerHome = ({ user }) => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [userLoc, setUserLoc] = useState([17.3850, 78.4867]); 

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserLoc([lat, lng]);
            axios.post(`${API_URL}/api/vendors/nearby`, { userLat: lat, userLng: lng })
              .then(res => setVendors(res.data)).catch(err => console.error(err));
        },
        () => console.error("Location access denied")
    );
  }, []);

  const handleBooking = async (serviceName, price) => {
    try {
    await axios.post(`${API_URL}/api/orders`, { customerId: user._id, vendorId: selectedVendor._id, serviceName, amount: price });
      alert("🎉 Order Placed Successfully!");
      setSelectedVendor(null);
    } catch (err) { alert("Booking failed"); }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 font-sans">
      
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Discover Services</h1>
            <p className="text-gray-500 font-medium mt-1">Finding hardware experts within a 20km radius.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-gray-700">Live Tracking Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[75vh]">
        
        {/* 🗺️ MAP SECTION */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative">
          <MapContainer center={userLoc} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <Marker position={userLoc} icon={userIcon}><Popup>You are here</Popup></Marker>
            <Circle center={userLoc} radius={20000} pathOptions={{ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.05, weight: 2 }} />
            {vendors.map(v => (
              <Marker key={v._id} position={[v.location.lat, v.location.lng]} icon={vendorIcon} eventHandlers={{ click: () => setSelectedVendor(v) }}>
                <Popup><b className="text-indigo-600">{v.shopName}</b><br/>{v.distance} km away</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* 📋 LIST SECTION */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="font-extrabold text-xl text-gray-800">Nearby Experts</h2>
            <p className="text-sm text-indigo-600 mt-1 font-semibold">{vendors.length} centers found</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {vendors.length === 0 ? (
                  <div className="text-center p-10 flex flex-col items-center justify-center h-full">
                      <div className="text-5xl mb-4 opacity-50">🔭</div>
                      <p className="text-gray-500 font-medium">No service centers found nearby.</p>
                  </div>
              ) : vendors.map(vendor => (
                <div 
                  key={vendor._id} 
                  onClick={() => setSelectedVendor(vendor)} 
                  className={`bg-white p-5 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md border
                  ${selectedVendor?._id === vendor._id ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-100'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{vendor.shopName}</h3>
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold">
                        {vendor.distance} km
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                      <span className="flex items-center justify-center bg-gray-100 text-gray-600 w-6 h-6 rounded-full text-xs font-bold">{vendor.services.length}</span>
                      <p className="text-sm text-gray-500 font-medium">Services Available</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 🛒 BOOKING MODAL */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl transform transition-all">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <h2 className="text-2xl font-black text-gray-900">{selectedVendor.shopName}</h2>
                      <p className="text-indigo-600 font-semibold text-sm mt-1">Select a service to book</p>
                  </div>
                  <button onClick={() => setSelectedVendor(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors">✕</button>
              </div>
              
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedVendor.services.length === 0 ? <p className="text-center text-gray-400 italic py-6">No services listed yet.</p> :
                  selectedVendor.services.map((s, i) => (
                      <div key={i} onClick={() => handleBooking(s.name, s.price)} className="group flex justify-between items-center p-4 border border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all">
                          <span className="font-semibold text-gray-700 group-hover:text-indigo-900">{s.name}</span>
                          <span className="font-black text-indigo-600 text-lg">₹{s.price}</span>
                      </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CustomerHome;
