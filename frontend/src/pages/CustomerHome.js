import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// IMPORT YOUR NEW PAGE
import VendorStore from './VendorStore'; 

const API_URL = process.env.REACT_APP_API_URL || 'https://computer-hardware-service-webapplication-production.up.railway.app';

const userIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const vendorIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

const CustomerHome = ({ user }) => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null); // Used to track which store is open
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

  // 🛑 PAGE ROUTING LOGIC: If a vendor is selected, show the Store Page instead of the Map!
  if (selectedVendor) {
      return (
          <VendorStore 
              vendor={selectedVendor} 
              user={user} 
              onBack={() => setSelectedVendor(null)} // This function allows them to return to the map
          />
      );
  }

  // 👇 OTHERWISE, RENDER THE NORMAL MAP VIEW 👇
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
              <Marker key={v._id} position={[v.location.lat, v.location.lng]} icon={vendorIcon}>
                <Popup>
                    <b className="text-indigo-600 block mb-1">{v.shopName}</b>
                    <button 
                        onClick={() => setSelectedVendor(v)} 
                        className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-md font-bold hover:bg-indigo-700 w-full mt-1"
                    >
                        Visit Store Page →
                    </button>
                </Popup>
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
                  className="bg-white p-5 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:border-indigo-500 hover:ring-4 hover:ring-indigo-50 shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-indigo-700">{vendor.shopName}</h3>
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold">
                        {vendor.distance} km
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                      <span className="flex items-center justify-center bg-gray-100 text-gray-600 w-6 h-6 rounded-full text-xs font-bold">{vendor.services.length}</span>
                      <p className="text-sm text-gray-500 font-medium">Services Available <span className="text-indigo-500 ml-1">→</span></p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerHome;
