# SSS Database Architecture & Seeding Guide

This directory manages the MongoDB database layer, data schemas documentation, and seed datasets for the SSS E-Commerce platform.

## Database Models (Mongoose)

| Model | Collection | Purpose | Key Attributes |
| :--- | :--- | :--- | :--- |
| **User** | `users` | Accounts & roles | `name`, `email` (unique), `password` (hashed with bcrypt), `role` (`'user'` or `'admin'`), `address` |
| **Product** | `products` | E-commerce catalog | `title`, `description`, `price`, `discountPrice`, `category`, `stock`, `images`, `sizes`, `colors`, `rating` |
| **Cart** | `carts` | Persistent shopping bag | `user` (ref: User), `items: [{ product, quantity, size, color, price }]` |
| **Order** | `orders` | Purchases & payments | `user`, `orderItems`, `shippingAddress`, `paymentMethod`, `paymentResult` (Razorpay details), `totalPrice`, `isPaid`, `orderStatus` |

## How to Seed Sample Data

1. Make sure your MongoDB URI is set in `backend/.env` (either local MongoDB or MongoDB Atlas M0 string).
2. Run the seed script:
```bash
node database/seed.js
```

### Pre-configured Seed Accounts:
- **Admin**: `admin@example.com` / `Admin@123password`
- **Customer**: `user@example.com` / `User@123password`
