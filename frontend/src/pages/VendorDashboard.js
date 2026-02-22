import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VendorDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState(user.services || []);
  const [newService, setNewService] = useState({ name: '', price: '' });

  const fetchData = async () => {
    if (!user || !user._id) return; 

    try {
      const orderRes = await axios.get(`http://localhost:5000/api/orders/vendor/${user._id}`);
      setOrders(orderRes.data.reverse());
      
      const userRes = await axios.get(`http://localhost:5000/api/vendor/${user._id}`);
      setServices(userRes.data.services);
    } catch (err) { console.error("Error fetching data:", err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const addService = async () => {
    if(!newService.name || !newService.price) return alert("Please fill in both name and price");
    
    try {
        await axios.post('http://localhost:5000/api/services/add', { 
            userId: user._id,
            name: newService.name, 
            price: newService.price 
        });
        setNewService({ name: '', price: '' });
        fetchData(); 
        alert("✅ Service Added!");
    } catch (err) {
        console.error(err);
        alert("Failed to add service.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
        await axios.put(`http://localhost:5000/api/orders/${id}`, { status });
        fetchData();
    } catch (err) { alert("Failed to update status"); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">🛠️ {user.shopName} Dashboard</h1>
            <p className="text-gray-500">Manage your services and incoming orders</p>
        </div>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold border border-green-200">
            🟢 Shop Online
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT: ORDER MANAGEMENT */}
        <div className="space-y-6">
            <h2 className="text-xl font-bold border-b pb-2 text-gray-700">📋 Incoming Orders</h2>
            {orders.length === 0 ? (
                <div className="bg-gray-50 p-10 rounded-xl text-center border border-dashed border-gray-300 text-gray-400">
                    No active orders right now.
                </div>
            ) : orders.map(order => (
                <div key={order._id} className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="font-bold text-lg text-indigo-700">{order.serviceName}</p>
                            <div className="mt-1 text-sm text-gray-600 space-y-1">
                                <p>👤 <span className="font-medium text-black">{order.customerId?.name || 'Guest'}</span></p>
                                <p>📧 {order.customerId?.email || 'No Email'}</p>
                                
                                {/* 📍 CUSTOMER LOCATION BUTTON */}
                                {order.customerId?.location && (
                                    <a 
                                        href={`https://www.google.com/maps?q=${order.customerId.location.lat},${order.customerId.location.lng}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline mt-1 bg-blue-50 px-2 py-1 rounded text-xs border border-blue-200"
                                    >
                                        📍 View Customer Map
                                    </a>
                                )}
                            </div>
                        </div>
                        <span className="font-bold text-xl">₹{order.amount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                            order.status === 'Accepted' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                            {order.status}
                        </span>
                        
                        <div className="space-x-2">
                            {order.status === 'Pending' && (
                                <>
                                    <button onClick={() => updateStatus(order._id, 'Accepted')} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow">Accept</button>
                                    <button onClick={() => updateStatus(order._id, 'Rejected')} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-600 transition shadow">Reject</button>
                                </>
                            )}
                            {order.status === 'Accepted' && (
                                <button onClick={() => updateStatus(order._id, 'Completed')} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow">Mark Done</button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* RIGHT: SERVICE MANAGEMENT */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-50 h-fit">
            <h2 className="text-xl font-bold mb-4 text-indigo-900 flex items-center gap-2">
                ⚙️ Manage Services
            </h2>
            
            {/* Input Form */}
            <div className="bg-indigo-50 p-4 rounded-lg mb-6 border border-indigo-100">
                <p className="text-xs font-bold text-indigo-400 mb-2 uppercase">Add New Service</p>
                <div className="flex gap-2">
                    <input 
                        placeholder="Service Name" 
                        className="border p-3 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        value={newService.name} 
                        onChange={e => setNewService({...newService, name: e.target.value})} 
                    />
                    <input 
                        placeholder="Price (₹)" 
                        type="number" 
                        className="border p-3 rounded-lg w-24 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        value={newService.price} 
                        onChange={e => setNewService({...newService, price: e.target.value})} 
                    />
                    <button onClick={addService} className="bg-indigo-600 text-white px-4 rounded-lg font-bold text-xl hover:bg-indigo-700 transition shadow-md">
                        +
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {services.length === 0 ? (
                    <p className="text-center text-gray-400 italic py-4">No services listed yet.</p>
                ) : services.map((s, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition shadow-sm">
                        <span className="text-gray-700 font-medium">{s.name}</span>
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded text-sm">₹{s.price}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
export default VendorDashboard;