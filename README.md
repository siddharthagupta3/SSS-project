# SHOP.CO - Full-Stack MERN E-Commerce Platform

A production-style, responsive, and interview-ready e-commerce web application built from scratch with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), featuring **Razorpay Test Mode** payment integration, **JWT authentication**, customer order management, and an **Admin control dashboard**.

---

## 📑 Table of Contents
- [Tech Stack](#tech-stack)
- [Folder Architecture](#folder-architecture)
- [Key Features](#key-features)
- [Local Setup & Installation](#local-setup--installation)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [Production Deployment Guide (100% Free Tiers)](#production-deployment-guide-100-free-tiers)
- [Custom Domain Setup (< 1000 INR)](#custom-domain-setup--1000-inr)
- [Live Site Verification Checklist](#live-site-verification-checklist)

---

## 🛠 Tech Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Axios |
| **State Management** | React Context API (`AuthContext`, `CartContext`) |
| **Backend** | Node.js, Express.js (MVC Pattern), Helmet, CORS, Morgan |
| **Database** | MongoDB Atlas (Free M0 Tier) with Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs password hashing |
| **Payment Gateway** | Razorpay Checkout (TEST Mode) + HMAC SHA-256 Signature Verification |
| **Security** | Express Rate Limiting on Auth, Helmet headers, Sanitized inputs |

---

## 📁 Folder Architecture

The codebase is organized into cleanly separated folders for backend, frontend, and database:

```text
SSS/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # DB connection & Razorpay setup
│   │   ├── controllers/      # auth, product, cart, order controllers
│   │   ├── middleware/       # JWT auth, admin guard, error handler, rate limiter
│   │   ├── models/           # User, Product, Cart, Order Mongoose schemas
│   │   ├── routes/           # REST endpoints
│   │   ├── utils/            # JWT token generator
│   │   └── server.js         # Express server entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React (Vite) + Tailwind CSS client
│   ├── src/
│   │   ├── api/              # Axios client with JWT interceptor
│   │   ├── components/       # Navbar, Footer, ProductCard, Icons, Guards
│   │   ├── context/          # AuthContext & CartContext
│   │   ├── pages/            # Home, Shop, ProductDetail, Cart, Checkout, Success, Orders, Admin, Auth
│   │   ├── App.jsx           # App routing with React Router
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── database/                 # Database scripts & mock datasets
│   ├── sampleProducts.json   # 15 realistic fashion products with images
│   ├── connection.js         # Mongoose connector utility
│   ├── seed.js               # Database population script
│   └── README.md
│
├── .gitignore                # Protects secrets & node_modules
├── package.json              # Root runner scripts
└── README.md
```

---

## 🚀 Key Features

### 1. Storefront & Catalog
- **Hero & Metrics Banner:** Streetwear aesthetic, international brand strip, and social proof numbers.
- **Search & Filters:** Instant keyword search, category filtering (T-Shirts, Shirts, Jeans, Jackets, Shoes, Accessories, Hoodies), sorting (Price low/high, Newest, Highest Rated), and pagination.
- **Product Detail:** Multi-image gallery with thumbnail selection, size picker, color picker, quantity counter, real-time stock availability, and guarantee badges.

### 2. Authentication & Authorization
- **JWT + bcryptjs:** Secure password hashing (10 salt rounds), stateless tokens with expiration.
- **Protected Routes:** Only logged-in customers can access checkout and view order history.
- **Role-Based Access Control (RBAC):** Admin users have access to `/admin` dashboard.
- **Brute-Force Rate Limiting:** 20 auth attempts per 15-minute window via `express-rate-limit`.

### 3. Shopping Bag & Checkout
- **Persistent Cart:** Synchronized with MongoDB for logged-in users; localStorage fallback for guests.
- **Promo Codes:** Dynamic promo code validation (e.g. code `SHOP10` applies 10% instant discount).
- **Free Delivery Calculation:** Automatically waives ₹99 delivery fee for orders above ₹999.

### 4. Razorpay Test Mode Payment
1. Server creates order via Razorpay SDK (`razorpay.orders.create`).
2. Client launches official Razorpay Checkout popup in **TEST mode**.
3. On payment completion, client submits `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.
4. Server verifies HMAC SHA-256 hash using Razorpay Key Secret before updating order to `isPaid: true`.
5. Product inventory automatically decrements upon successful payment.

### 5. Admin Dashboard (`/admin`)
- Real-time revenue, total order count, and catalog count metrics.
- **Product Management:** Add new product, edit existing product, or delete items.
- **Order Management:** View all customer orders with addresses and update fulfillment status (`Processing` ➔ `Shipped` ➔ `Delivered`).

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally OR a free MongoDB Atlas connection string

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <your-repo-url>
cd SSS

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
- In `backend/`, copy `.env.example` to `.env` and adjust values.
- In `frontend/`, copy `.env.example` to `.env`.

### 3. Seed Sample Database
Populate the database with 15 sample products, an Admin account, and a Demo Customer account:
```bash
# Run from root or inside database/
node database/seed.js
```

### 4. Run Both Servers
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Client running at http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sss_ecommerce?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_yourKeyId
RAZORPAY_KEY_SECRET=yourRazorpayKeySecret
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_yourKeyId
```

---

## 👥 Default Testing Credentials

Once seeded with `node database/seed.js`, use the 1-click test buttons on `/login` or enter:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin@123password` | Full Store & Admin Dashboard |
| **Customer** | `user@example.com` | `User@123password` | Storefront, Cart, Checkout, My Orders |

---

## 🌐 Production Deployment Guide (100% Free Tiers)

### 1. Database: MongoDB Atlas (Free M0 Cluster)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.
2. Create a free **M0 Sandbox** cluster (choose AWS, Mumbai `ap-south-1` region for fastest India latency).
3. Under **Database Access**, create a user with read/write privileges.
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`).
5. Click **Connect** ➔ **Drivers** (Node.js) and copy the connection string. Replace `<username>` and `<password>` with your database user credentials.

### 2. Backend: Render.com (Free Web Service)
1. Sign up on [Render.com](https://render.com/) and connect your GitHub account.
2. Click **New +** ➔ **Web Service** and select your repository.
3. Configure the service:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGO_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A strong random 32-character string*
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: *Your Vercel frontend URL (e.g. `https://my-shop.vercel.app`)*
   - `RAZORPAY_KEY_ID`: *Your Razorpay test key*
   - `RAZORPAY_KEY_SECRET`: *Your Razorpay test secret*
5. Click **Deploy**. Note down your live backend URL (e.g. `https://sss-backend.onrender.com`).

### 3. Frontend: Vercel (Free Static / SPA Hosting)
1. Sign up on [Vercel](https://vercel.com/) and connect your GitHub account.
2. Click **Add New...** ➔ **Project** and select your repository.
3. In Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click edit and choose `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: *Your Render backend URL (e.g. `https://sss-backend.onrender.com`)*
   - `VITE_RAZORPAY_KEY_ID`: *Your Razorpay test key*
5. Click **Deploy**. Your storefront is now live worldwide with global CDN and automated SSL!
6. Remember to copy your Vercel URL and update `CLIENT_URL` in your Render backend settings so CORS allows requests.

---

## 🏷 Custom Domain Setup (< 1000 INR)

To brand your store with a custom `.in` or `.com` domain:

1. **Buy a Cheap Domain (< ₹499 - ₹899/year):**
   - Visit [Hostinger.in](https://www.hostinger.in/), [Namecheap](https://www.namecheap.com/), or [GoDaddy](https://www.godaddy.com/en-in).
   - `.in` domains typically cost between ₹399 - ₹499 for the first year.
2. **Connect Domain in Vercel:**
   - In Vercel, open your project ➔ **Settings** ➔ **Domains**.
   - Type your custom domain (e.g. `yourbrand.in`).
3. **Configure DNS Records in Domain Registrar:**
   - Add an **A Record**:
     - **Name:** `@` (or leave blank)
     - **Type:** `A`
     - **Value:** `76.76.21.21` (Vercel IP)
   - Add a **CNAME Record**:
     - **Name:** `www`
     - **Type:** `CNAME`
     - **Value:** `cname.vercel-dns.com`
4. **Automatic SSL & HTTPS:**
   - Vercel automatically provisions a free Let's Encrypt SSL certificate within 5–15 minutes.
5. *(Optional Backend Subdomain)*:
   - In your domain DNS, add a CNAME `api` pointing to your Render service address (e.g. `sss-backend.onrender.com`) to have `api.yourbrand.in`.

---

## ✅ Live Site Verification Checklist

Follow this checklist to test the entire application end-to-end:

- [ ] **1. User Signup:** Register a new user at `/register`. Check that user is created and redirected to catalog.
- [ ] **2. User Login:** Log out and log in at `/login` with credentials. Verify user name appears in Navbar.
- [ ] **3. Browse & Filter:** Search for a product (e.g. "Cotton"), click category filters, and test pagination.
- [ ] **4. Product Detail:** Select sizes, colors, and quantity, and click "Add to Cart". Check toast confirmation.
- [ ] **5. Cart Management:** Open `/cart`, adjust quantities, delete an item, apply promo code `SHOP10`.
- [ ] **6. Razorpay Test Payment:** Proceed to checkout, enter shipping address, and click "Pay with Razorpay". Complete test payment.
- [ ] **7. Order Confirmation:** Verify redirection to `/order-success/:id` with order reference and paid status.
- [ ] **8. Order History:** Visit `/my-orders` and verify the newly placed order appears with "Paid" status.
- [ ] **9. Admin Control Panel:** Log in as `admin@example.com`, access `/admin`, change order status to `Delivered`, and add a new product.
