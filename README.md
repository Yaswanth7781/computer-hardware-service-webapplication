Gemini said
Here is a complete, professional, and highly detailed README.md file for your GitHub repository. It covers everything a recruiter, developer, or open-source contributor would need to understand, run, and appreciate your project.

You can copy this entire block and paste it directly into a new file named README.md in the root of your GitHub repository.

Markdown
# 🛠️ Smart Hardware Service Aggregator Platform

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Status](https://img.shields.io/badge/Status-Deployed_on_Railway-success?style=for-the-badge&logo=railway)

A full-stack, location-aware web application built on the MERN stack designed to seamlessly connect customers with local hardware repair and service centers. 

By leveraging the HTML5 Geolocation API and backend Haversine formula calculations, the platform automatically matches customers with vendors within a strict 20km radius. It features secure, dual-role dashboards, real-time map tracking, and a modern glassmorphism UI.

---

## ✨ Key Features

### 👤 For Customers
* **Location-Based Discovery:** Automatically fetches user GPS coordinates and filters service centers within a 20km radius.
* **Interactive Maps:** Uses `react-leaflet` to visually plot nearby vendors on a dynamic, zoomable map.
* **Dedicated Vendor Stores:** Click on any map pin or list item to open a dedicated, full-screen profile for that specific shop.
* **Instant Booking:** Browse customized service catalogs and place orders with a single click.

### 🏪 For Vendors (Service Centers)
* **Automated Order Polling:** The dashboard continuously polls the server to receive incoming customer orders in near real-time.
* **In-App Customer Tracking:** Vendors can click "Track Location" on any incoming order to open a frosted-glass map modal pinpointing the customer's exact GPS coordinates.
* **Dynamic Catalog Management:** Vendors can easily add, price, and manage the services they offer directly from their dashboard.
* **Order Management Pipeline:** Update order statuses seamlessly through a `Pending` ➔ `Accepted` ➔ `Completed` pipeline.

---

## 💻 Tech Stack

**Frontend (Client-Side)**
* **React.js:** Single Page Application (SPA) architecture.
* **Tailwind CSS:** Utility-first CSS framework for responsive, modern UI (glassmorphism, gradients).
* **React-Leaflet:** Map components and rendering.
* **Axios:** Asynchronous HTTP client for API requests.

**Backend (Server-Side)**
* **Node.js & Express.js:** RESTful API architecture.
* **Haversine Formula:** Mathematical algorithm implemented on the server to calculate spherical distance between GPS coordinates.
* **JSON Web Tokens (JWT):** Secure, stateless user authentication and session management.
* **Bcrypt.js:** Cryptographic password hashing.

**Database & Cloud**
* **MongoDB & Mongoose:** NoSQL database with strict ODM schemas (`UserSchema`, `OrderSchema`).
* **Railway:** Cloud infrastructure hosting the live Node.js backend, React frontend, and MongoDB instance.

---

## 🚀 Getting Started (Local Development)

To run this project locally on your machine, follow these steps:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your machine.

### 2. Clone the Repository
```bash
git clone [https://github.com/Yaswanth7781/computer-hardware-service-webapplication.git](https://github.com/Yaswanth7781/computer-hardware-service-webapplication.git)
cd computer-hardware-service-webapplication
3. Backend Setup
Bash
cd backend
npm install
Create a .env file in the backend folder and add the following:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_jwt_key
Start the backend server:

Bash
node server.js
# You should see: ✅ MongoDB Connected
4. Frontend Setup
Open a new terminal window/tab:

Bash
cd frontend
npm install
Create a .env file in the frontend folder and add the following:

Code snippet
REACT_APP_API_URL=http://localhost:5000
Start the React application:

Bash
npm start
# The app will open at http://localhost:3000
🛣️ API Endpoints Reference
Authentication
POST /api/auth/register - Register a new Customer or Vendor

POST /api/auth/login - Authenticate user and receive JWT

Vendors & Services
POST /api/vendors/nearby - Get all vendors within a 20km radius (requires userLat, userLng)

GET /api/vendor/:id - Fetch a specific vendor's profile and catalog

POST /api/services/add - Add a new service to a vendor's catalog

Orders
POST /api/orders - Create a new service order

GET /api/orders/vendor/:vendorId - Retrieve all orders for a specific vendor

PUT /api/orders/:id - Update an order's status (Pending, Accepted, Rejected, Completed)

