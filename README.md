# SHOP.CO - Full-Stack MERN E-Commerce Platform

A production-grade, authentic, and interview-ready e-commerce web application inspired by Flipkart and Amazon, built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Features **Google OAuth2 Sign-In / Account Creation**, **Gmail 6-Digit OTP Verification**, **Razorpay Payment Integration**, **Interactive Wishlist**, **Customer Ratings & Reviews**, **PIN Code Delivery Estimation**, and an **Admin Control Dashboard**.

---

## 📑 Table of Contents
- [Tech Stack](#tech-stack)
- [Folder Architecture](#folder-architecture)
- [Flipkart & Amazon-Inspired Features](#flipkart--amazon-inspired-features)
- [Where to Add Your API Keys](#where-to-add-your-api-keys)
- [Local Setup & Installation](#local-setup--installation)
- [Production Deployment Guide (Free Tiers)](#production-deployment-guide-free-tiers)
- [Custom Domain Setup (< 1000 INR)](#custom-domain-setup--1000-inr)

---

## 🛠 Tech Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Axios |
| **State Management** | React Context API (`AuthContext`, `CartContext`, `WishlistContext`) |
| **Backend** | Node.js, Express.js (MVC Pattern), Helmet, CORS, Morgan |
| **Database** | MongoDB Atlas (Free M0 Tier) with Mongoose ODM |
| **Authentication** | Google OAuth2 (`google-auth-library`), JWT, bcryptjs, Gmail OTP (`nodemailer`) |
| **Payment Gateway** | Razorpay Checkout (TEST/Live) + HMAC SHA-256 Server Signature Verification |
| **Security** | Express Rate Limiting on Auth, Helmet headers, Sanitized inputs |

---

## 📁 Folder Architecture

```text
SSS/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # DB connection & Razorpay setup
│   │   ├── controllers/      # auth, product, cart, order controllers
│   │   ├── data/             # Sample data (products.json)
│   │   ├── middleware/       # JWT auth, admin guard, error handler, rate limiter
│   │   ├── models/           # User, Product, Cart, Order Mongoose schemas
│   │   ├── routes/           # auth, product, cart, order REST endpoints
│   │   ├── seeds/            # Database seeding scripts
│   │   ├── utils/            # JWT generator, nodemailer email service
│   │   └── server.js         # Express server entry point
│   ├── .env.example          # Clean configuration template
│   └── package.json
│
├── frontend/                 # React (Vite) + Tailwind CSS client
│   ├── src/
│   │   ├── api/              # Axios client with JWT interceptor
│   │   ├── components/       # Navbar, Footer, ProductCard, Icons, Guards
│   │   ├── context/          # AuthContext, CartContext, WishlistContext
│   │   ├── pages/            # Home, Shop, ProductDetail, Cart, Wishlist, Checkout, Orders, Admin, Auth
│   │   ├── App.jsx           # App routing with React Router
│   │   ├── index.css         # Global styles
│   │   └── main.jsx
│   ├── index.html            # HTML entry with Google script
│   ├── .env.example
│   └── package.json
│
├── .gitignore                # Protects secrets & node_modules
├── package.json              # Root runner scripts
└── README.md
```

---

## 🌟 Flipkart & Amazon-Inspired Features

1. **Google & Gmail Account Creation (One-Click Verification):**
   - Direct "Continue with Google" button on both Login and Register screens.
   - Automatically verifies Gmail address cryptographically through Google Identity Services (`google-auth-library`).
   - Also supports regular email registration with **6-Digit Gmail OTP Verification** via `nodemailer`.
2. **Infinite Left-to-Right Moving Brand & Announcement Marquee:**
   - Luxury brand strip (**VERSACE ✦ ZARA ✦ GUCCI ✦ PRADA ✦ CALVIN KLEIN ✦ NIKE ✦ LEVI'S ✦ ADIDAS ✦ PUMA**) continuously moving smoothly from left to right.
   - Auto-pauses on hover.
3. **Flipkart PIN Code Delivery Checker:**
   - Enter any 6-digit Indian PIN code on the Product page to calculate real-time estimated arrival date, free delivery eligibility, COD availability, and 7-day replacement policy.
4. **Bank Offers & Coupons Accordion:**
   - Displays real-time bank discounts (10% instant discount on ICICI/HDFC cards) and coupon code `SHOP10`.
5. **Customer Ratings & Reviews System:**
   - Visual star breakdown progress bars (5★, 4★, 3★, 2★, 1★).
   - Verified Buyer badges on customer reviews.
   - Interactive review submission form for verified customers.
6. **Wishlist (Save for Later):**
   - Heart toggle on product cards with instant fill animation.
   - Header badge counter and dedicated `/wishlist` management page.
7. **Complete Indian Shipping Address System:**
   - Full recipient name, 10-digit mobile number (`+91`), flat/house number, street/area, landmark, 6-digit PIN code, city, and 28 Indian States & 8 UTs dropdown selector.
8. **Live Order Tracking Timeline:**
   - 4-step visual progress bar: `Confirmed` ➔ `Packed` ➔ `Shipped` ➔ `Delivered`.
9. **Admin Control Dashboard (`/admin`):**
   - Real-time revenue metrics, order fulfillment status updater (`Processing` ➔ `Shipped` ➔ `Delivered`), and product catalog manager (Add/Edit/Delete).

---

## 🔑 Where to Add Your API Keys

All code is fully written and working. Keep your live API keys in `backend/.env` and `frontend/.env` (which are already created and added to `.gitignore`):

### 1. In `backend/.env`:
```env
# MongoDB Atlas Database URI (https://cloud.mongodb.com)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sss_ecommerce?retryWrites=true&w=majority

# Razorpay Credentials (https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_yourKeyId
RAZORPAY_KEY_SECRET=yourKeySecret

# Google Sign-In Client ID (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Gmail SMTP for sending real OTP emails (https://myaccount.google.com/apppasswords)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_gmail_app_password
```

### 2. In `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_yourKeyId
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 💻 Local Setup & Installation

```bash
# 1. Seed database with 24 products & default accounts
cd backend
npm run seed

# 2. Start Backend (Terminal 1)
cd backend
npm run dev
# Running on http://localhost:5000

# 3. Start Frontend (Terminal 2)
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 🌐 Production Deployment Guide (Free Tiers)

1. **Database:** Create a free MongoDB Atlas M0 cluster, whitelist `0.0.0.0/0`, and copy your connection string into `backend/.env`.
2. **Backend (Render.com):**
   - Connect repository, set Root Directory to `backend`.
   - Build: `npm install`, Start: `npm start`.
   - Add environment variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, etc.).
3. **Frontend (Vercel.com):**
   - Connect repository, set Root Directory to `frontend`.
   - Framework: `Vite`, Output: `dist`.
   - Add environment variable `VITE_API_URL` pointing to your Render backend.

---

## 🏷 Custom Domain Setup (< 1000 INR)

1. Buy a `.in` domain (₹399 - ₹499/year) from Hostinger, Namecheap, or GoDaddy.
2. In Vercel Project Settings ➔ **Domains**, add `yourbrand.in`.
3. In your Domain Registrar's DNS Manager, configure:
   - **Type A:** Name `@`, Value `76.76.21.21`
   - **Type CNAME:** Name `www`, Value `cname.vercel-dns.com`
4. Vercel automatically activates free SSL / HTTPS encryption within minutes.
