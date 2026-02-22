import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'; // 👈 Added Circle
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- ICONS SETUP ---
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const vendorIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const CustomerHome = ({ user }) => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [userLoc, setUserLoc] = useState([17.3850, 78.4867]); 

  // Get Location & Fetch Vendors
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserLoc([lat, lng]);

            // Fetch Vendors (Backend already filters > 20km)
            axios.post('http://localhost:5000/api/vendors/nearby', { userLat: lat, userLng: lng })
                .then(res => setVendors(res.data))
                .catch(err => console.error(err));
        },
        (err) => console.error("Location access denied")
    );
  }, []);

  const handleBooking = async (serviceName, price) => {
    try {
      await axios.post('http://localhost:5000/api/orders', {
          customerId: user._id,
          vendorId: selectedVendor._id,
          serviceName: serviceName,
          amount: price
      });
      alert("✅ Order Placed Successfully!");
      setSelectedVendor(null);
    } catch (err) { alert("Booking failed"); }
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[90vh]">
      
      {/* 🗺️ MAP SECTION */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border overflow-hidden relative z-0">
        <MapContainer center={userLoc} zoom={11} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* 🔵 USER MARKER */}
          <Marker position={userLoc} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>

          {/* 🔵 20KM RADIUS CIRCLE */}
          <Circle 
            center={userLoc} 
            radius={20000} // 20,000 meters = 20km
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} 
          />

          {/* 🔴 VENDOR MARKERS */}
          {vendors.map(v => (
            <Marker 
              key={v._id} 
              position={[v.location.lat, v.location.lng]} 
              icon={vendorIcon}
              eventHandlers={{ click: () => setSelectedVendor(v) }}
            >
              <Popup><b>{v.shopName}</b><br/>{v.distance} km away</Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-md z-[400] text-xs font-bold">
            Scanning 20km Radius 📡
        </div>
      </div>

      {/* 📋 LIST SECTION */}
      <div className="bg-white rounded-2xl shadow-xl border flex flex-col h-full overflow-hidden z-10">
        <div className="p-5 border-b bg-gray-50">
          <h2 className="font-bold text-xl text-gray-800">Nearby Service Centers</h2>
          <p className="text-xs text-indigo-600 mt-1 font-bold">Showing results within 20km</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {vendors.length === 0 ? (
                <div className="text-center p-10 text-gray-400">
                    <div className="text-4xl mb-2">🔭</div>
                    No service centers found within 20km.
                </div>
            ) : vendors.map(vendor => (
              <div 
                key={vendor._id} 
                onClick={() => setSelectedVendor(vendor)} 
                className={`p-4 rounded-xl cursor-pointer transition border border-transparent 
                ${selectedVendor?._id === vendor._id ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'hover:bg-gray-50 border-gray-100'}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900">{vendor.shopName}</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                      {vendor.distance} km
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{vendor.services.length} services available</p>
              </div>
            ))}
        </div>
      </div>

      {/* 🛒 BOOKING MODAL */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-bounce-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedVendor.shopName}</h2>
                <button onClick={() => setSelectedVendor(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Select a service to book:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedVendor.services.length === 0 ? <p className="text-center text-gray-400 italic">No services listed.</p> :
                selectedVendor.services.map((s, i) => (
                    <div key={i} onClick={() => handleBooking(s.name, s.price)} className="flex justify-between p-3 border rounded hover:bg-indigo-50 cursor-pointer">
                        <span className="font-medium">{s.name}</span>
                        <span className="font-bold text-indigo-600">₹{s.price}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CustomerHome;