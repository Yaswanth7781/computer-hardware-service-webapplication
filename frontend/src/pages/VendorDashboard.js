import React, { useState, useEffect } from 'react';
import axios from 'axios';
// IMPORT MAP COMPONENTS
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const API_URL = process.env.REACT_APP_API_URL || 'https://computer-hardware-service-webapplication-production.up.railway.app';

// CUSTOMER MAP MARKER
const customerIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

const VendorDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState(user.services || []);
  const [newService, setNewService] = useState({ name: '', price: '' });
  
  // STATE FOR TRACKING CUSTOMER MAP
  const [trackingCustomer, setTrackingCustomer] = useState(null);

  const fetchData = async () => {
    if (!user || !user._id) return; 
    try {
      const orderRes = await axios.get(`${API_URL}/api/orders/vendor/${user._id}`);
      setOrders(orderRes.data.reverse());
      const userRes = await axios.get(`${API_URL}/api/vendor/${user._id}`);
      setServices(userRes.data.services);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addService = async () => {
    if(!newService.name || !newService.price) return alert("Please fill in both name and price");
    try {
        await axios.post(`${API_URL}/api/services/add`, { userId: user._id, name: newService.name, price: newService.price });
        setNewService({ name: '', price: '' });
        fetchData(); 
    } catch (err) { alert("Failed to add service."); }
  };

  const updateStatus = async (id, status) => {
    try { await axios.put(`${API_URL}/api/orders/${id}`, { status }); fetchData(); } 
    catch (err) { alert("Failed to update status"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* BANNER HEADER */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-3xl p-8 md:p-10 shadow-xl text-white flex flex-col md:flex-row justify-between items-center md:items-start gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 text-center md:text-left">
              <h1 className="text-4xl font-black mb-2">{user.shopName} Dashboard</h1>
              <p className="text-indigo-200 text-lg font-medium">Manage your hardware services and customer requests</p>
          </div>
          <div className="relative z-10 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
              <span className="font-bold tracking-wide">Accepting Orders</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: ORDER MANAGEMENT */}
          <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">📦</div>
                <h2 className="text-2xl font-bold text-gray-800">Incoming Orders</h2>
              </div>

              {orders.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center h-64">
                      <span className="text-4xl mb-4 opacity-50">📋</span>
                      <p className="text-gray-500 font-medium text-lg">No active orders right now.</p>
                  </div>
              ) : orders.map(order => (
                  <div key={order._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-50 pb-4 mb-4">
                          <div>
                              <p className="font-black text-xl text-gray-900">{order.serviceName}</p>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                                  <span className="flex items-center gap-1">👤 <span className="text-gray-700">{order.customerId?.name || 'Guest'}</span></span>
                                  
                                  {/* 👇 CHANGED FROM <a> TAG TO BUTTON 👇 */}
                                  {order.customerId?.location && (
                                      <button 
                                         onClick={() => setTrackingCustomer(order.customerId)}
                                         className="flex items-center gap-1 text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors font-bold cursor-pointer border border-indigo-100">
                                          📍 Track Location
                                      </button>
                                  )}
                              </div>
                          </div>
                          <div className="text-left md:text-right">
                              <span className="block text-2xl font-black text-indigo-600">₹{order.amount}</span>
                          </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide ${
                              order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                              order.status === 'Accepted' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                              {order.status.toUpperCase()}
                          </span>
                          
                          <div className="flex gap-2 w-full sm:w-auto">
                              {order.status === 'Pending' && (
                                  <>
                                      <button onClick={() => updateStatus(order._id, 'Accepted')} className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Accept</button>
                                      <button onClick={() => updateStatus(order._id, 'Rejected')} className="flex-1 sm:flex-none bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors">Reject</button>
                                  </>
                              )}
                              {order.status === 'Accepted' && (
                                  <button onClick={() => updateStatus(order._id, 'Completed')} className="w-full sm:w-auto bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-600 transition-colors">Mark as Completed</button>
                              )}
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          {/* RIGHT: SERVICE MANAGEMENT */}
          <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">⚙️</div>
                <h2 className="text-2xl font-bold text-gray-800">Your Services</h2>
              </div>
              
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="bg-indigo-50/50 p-5 rounded-2xl mb-8 border border-indigo-100">
                      <p className="text-sm font-bold text-indigo-800 mb-3">Add New Service</p>
                      <div className="space-y-3">
                          <input placeholder="Service Name (e.g. Screen Repair)" className="w-full p-3 bg-white border border-indigo-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
                          <div className="flex gap-3">
                              <input placeholder="Price (₹)" type="number" className="w-full p-3 bg-white border border-indigo-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} />
                              <button onClick={addService} className="bg-indigo-600 text-white px-5 rounded-xl font-black text-xl hover:bg-indigo-700 transition-colors shadow-md">+</button>
                          </div>
                      </div>
                  </div>

                  <div className="space-y-3">
                      {services.length === 0 ? (
                          <p className="text-center text-gray-400 font-medium py-6">Your catalog is empty.</p>
                      ) : services.map((s, i) => (
                          <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                              <span className="text-gray-800 font-semibold">{s.name}</span>
                              <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">₹{s.price}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        </div>

        {/* 🗺️ CUSTOMER TRACKING MAP MODAL */}
        {trackingCustomer && trackingCustomer.location && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] w-full max-w-3xl shadow-2xl transform transition-all relative overflow-hidden flex flex-col h-[70vh]">
              
              <div className="flex justify-between items-center mb-4 shrink-0">
                  <div>
                      <h2 className="text-2xl font-black text-gray-900">Customer Location</h2>
                      <p className="text-indigo-600 font-semibold text-sm mt-1">
                          Tracking {trackingCustomer.name || 'Customer'}
                      </p>
                  </div>
                  <button onClick={() => setTrackingCustomer(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-10 h-10 flex items-center justify-center font-bold transition-colors">✕</button>
              </div>
              
              {/* Leaflet Map Box */}
              <div className="flex-1 rounded-2xl overflow-hidden border-2 border-indigo-50 shadow-inner relative z-10">
                  <MapContainer 
                      center={[trackingCustomer.location.lat, trackingCustomer.location.lng]} 
                      zoom={14} 
                      style={{ height: "100%", width: "100%" }}
                  >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                      <Marker 
                          position={[trackingCustomer.location.lat, trackingCustomer.location.lng]} 
                          icon={customerIcon}
                      >
                          <Popup>
                              <b className="text-indigo-600">{trackingCustomer.name || 'Customer'}</b><br/>
                              Service Request Location
                          </Popup>
                      </Marker>
                  </MapContainer>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VendorDashboard;
