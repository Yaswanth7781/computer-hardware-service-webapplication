require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Nodemailer removed

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hardwareDB')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

// --- 2. MODELS ---
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['customer', 'vendor'], default: 'customer' },
  shopName: String,
  location: { lat: Number, lng: Number }, 
  services: [{ name: String, price: Number }],
  rating: { type: Number, default: 0 }
});
const User = mongoose.model('User', UserSchema);

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  serviceName: String,
  amount: Number,
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

// --- 3. HELPER: Haversine Distance ---
const getDistance = (lat1, lon1, lat2, lon2) => {
    if(!lat1 || !lat2) return 0;
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};

// --- 4. ROUTES ---

// AUTH: Register (One-Step Sign Up without OTP)
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, role, shopName, lat, lng } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered. Please Login.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ 
        email, name, role, shopName, 
        location: { lat, lng }, 
        password: hashedPassword, 
        services: [] 
    });

    try {
        await user.save();
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ token, user });
    } catch (err) { res.status(500).json({ error: 'Registration failed' }); }
});

// AUTH: Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid Password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user });
});

// VENDOR: Get Nearby (Filtered 20km)
app.post('/api/vendors/nearby', async (req, res) => {
  const { userLat, userLng } = req.body;
  try {
    const vendors = await User.find({ role: 'vendor' });
    const nearbyVendors = vendors.map(vendor => {
      const dist = getDistance(userLat, userLng, vendor.location.lat, vendor.location.lng);
      return { ...vendor._doc, distance: Number(dist.toFixed(1)) };
    })
    .filter(v => v.distance <= 20) 
    .sort((a, b) => a.distance - b.distance);
    res.json(nearbyVendors);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch vendors' }); }
});

// VENDOR: Add New Service
app.post('/api/services/add', async (req, res) => {
    const { userId, name, price } = req.body;
    
    if (!userId || userId === 'undefined') {
        return res.status(400).json({ error: 'Invalid User ID' });
    }

    try {
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ error: "User not found" });

        user.services.push({ name, price });
        await user.save();
        res.json({ message: 'Service added', services: user.services });
    } catch(err) { 
        console.error(err);
        res.status(500).json({ error: 'Failed to add service' }); 
    }
});

// VENDOR: Get Profile
app.get('/api/vendor/:id', async (req, res) => {
    if (!req.params.id || req.params.id === 'undefined') return res.status(400).json({});
    const user = await User.findById(req.params.id);
    res.json(user);
});

// ORDER: Create
app.post('/api/orders', async (req, res) => {
  const { customerId, vendorId, serviceName, amount } = req.body;
  const newOrder = new Order({ customerId, vendorId, serviceName, amount });
  await newOrder.save();
  res.json({ message: 'Order placed successfully' });
});

// ORDER: Get Vendor's Orders
app.get('/api/orders/vendor/:vendorId', async (req, res) => {
  if (!req.params.vendorId || req.params.vendorId === 'undefined') return res.json([]);
  
  const orders = await Order.find({ vendorId: req.params.vendorId })
                              .populate('customerId', 'name email location'); 
  res.json(orders);
});

// ORDER: Update Status
app.put('/api/orders/:id', async (req, res) => {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updatedOrder);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));