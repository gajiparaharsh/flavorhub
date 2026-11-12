# 🍽️ FlavorHub — Complete Project Summary

## 📋 Project Overview

**FlavorHub** is a **full-stack online food ordering web application** built for a restaurant. It enables customers to browse food menus, place orders, track deliveries in real-time, manage their profiles, and provides an admin dashboard for restaurant management.

> **Project Type:** Full-Stack Web Application (MERN Stack)
> **Project Path:** `d:\PROJECG II - New\flavorhub-main`

---

## 🛠️ Technologies & Languages Used

### Frontend (Client-Side)

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Library — Component-based frontend framework |
| **TypeScript** | Programming Language — Type-safe JavaScript |
| **Vite** | Build Tool — Fast development server & bundler | 
| **React Router DOM v6** | Routing — Client-side navigation between pages |
| **TailwindCSS** | Styling — Utility-first CSS framework |
| **Shadcn/UI (Radix UI)** | UI Components — Dialogs, Tabs, Buttons, Inputs, etc. |
| **Lucide React** | Icons — Modern icon library |
| **React Query (TanStack)** | State Management — Server state & data fetching |
| **Zod** | Validation — Form input validation schemas |
| **Recharts** | Charts — Admin analytics data visualization |
| **Socket.io Client** | Real-time — Live order tracking & updates |
| **Sonner** | Notifications — Toast notifications |

### Backend (Server-Side)

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime — JavaScript server runtime |
| **Express.js** | Web Framework — REST API server |
| **MongoDB** | Database — NoSQL document database |
| **Mongoose** | ODM — MongoDB object modeling & schemas |
| **JWT (jsonwebtoken)** | Authentication — Token-based auth system |
| **bcryptjs** | Security — Password hashing (12 salt rounds) |
| **express-rate-limit** | Security — Brute force protection & rate limiting |
| **express-validator** | Validation — Request input validation |
| **Socket.io** | Real-time — WebSocket server for live updates |
| **Nodemailer** | Email — Welcome email service (Gmail SMTP) |
| **Multer** | File Upload — Image upload handling |
| **Nodemon** | Dev Tool — Auto-restart server on file changes |

### Database

| Technology | Details |
|------------|---------|
| **MongoDB** | Local instance at `mongodb://localhost:27017/flavorhub` |
| **Collections** | Users, MenuItems, Orders, Favorites, Reviews, Promotions |

---

## 📁 Project Structure

```
flavorhub-main/
├── 📂 src/                         # Frontend Source Code
│   ├── 📂 pages/                   # All Page Components
│   │   ├── Index.tsx               # Home Page
│   │   ├── MenuPage.tsx            # Food Menu with filters
│   │   ├── AuthPage.tsx            # Login / Register
│   │   ├── ProfilePage.tsx         # User Profile + Security
│   │   ├── CartPage.tsx            # Shopping Cart
│   │   ├── CheckoutPage.tsx        # Order Checkout
│   │   ├── FavoritesPage.tsx       # Saved Favorites
│   │   ├── OrderTrackingPage.tsx   # Live Order Tracking
│   │   ├── AboutPage.tsx           # About Restaurant
│   │   ├── IndianCuisinePage.tsx   # Indian Cuisine Info
│   │   ├── NotFound.tsx            # 404 Page
│   │   └── 📂 admin/              # Admin Panel Pages
│   │       ├── AdminDashboard.tsx  # Admin Overview
│   │       ├── AdminOrders.tsx     # Manage Orders
│   │       ├── AdminMenu.tsx       # Manage Menu Items
│   │       ├── AdminCustomers.tsx  # Manage Customers
│   │       └── AdminAnalytics.tsx  # Analytics & Reports
│   ├── 📂 components/              # Reusable UI Components
│   │   ├── Navbar.tsx              # Navigation Bar
│   │   ├── Hero.tsx                # Hero Section
│   │   ├── Footer.tsx              # Footer
│   │   ├── FoodCard.tsx            # Food Item Card
│   │   ├── FoodItemModal.tsx       # Food Detail Modal
│   │   ├── ProtectedRoute.tsx      # Auth Route Guard
│   │   ├── ThemeToggle.tsx         # Dark/Light Mode
│   │   ├── ScrollReveal.tsx        # Scroll Animations
│   │   ├── FestivalOffersBanner.tsx# Promo Banner
│   │   ├── CategoryFilter.tsx      # Menu Category Filter
│   │   ├── DietaryLabels.tsx       # Veg/Vegan/GF Labels
│   │   └── 📂 ui/                 # 49 Shadcn UI Components
│   ├── 📂 context/                 # React Context Providers
│   │   ├── AuthContext.tsx         # Authentication State
│   │   └── CartContext.tsx         # Shopping Cart State
│   ├── 📂 hooks/                   # Custom React Hooks
│   │   ├── useMenuItems.ts         # Menu Data Fetching
│   │   ├── useUserProfile.ts       # Profile Management
│   │   ├── useFavorites.ts         # Favorites Management
│   │   ├── useOrderTracking.ts     # Order Tracking
│   │   ├── useAdminOrders.ts       # Admin Order Management
│   │   ├── useAdminCustomers.ts    # Admin Customer Mgmt
│   │   ├── useAnalytics.ts         # Analytics Data
│   │   ├── usePromotions.ts        # Promotions/Offers
│   │   ├── useRecommendations.ts   # Food Recommendations
│   │   └── useRestaurantHours.ts   # Operating Hours
│   └── 📂 integrations/mongodb/   # API Client
│       ├── client.ts              # HTTP API Client Class
│       ├── socket.ts              # WebSocket Client
│       └── index.ts               # Exports & Types
│
├── 📂 backend/                     # Backend Source Code
│   └── 📂 src/
│       ├── server.js              # Express App Entry Point
│       ├── 📂 config/
│       │   └── database.js        # MongoDB Connection
│       ├── 📂 models/             # Mongoose Schemas
│       │   ├── User.js            # User Model
│       │   ├── MenuItem.js        # Menu Item Model
│       │   ├── Order.js           # Order Model
│       │   ├── Favorite.js        # Favorites Model
│       │   ├── Review.js          # Reviews Model
│       │   └── Promotion.js       # Promotions Model
│       ├── 📂 routes/             # API Route Handlers
│       │   ├── auth.js            # Auth (Login/Register/Security)
│       │   ├── menu.js            # Menu CRUD Operations
│       │   ├── orders.js          # Order Management
│       │   ├── users.js           # User Profile
│       │   ├── favorites.js       # Favorites
│       │   ├── reviews.js         # Reviews/Ratings
│       │   ├── promotions.js      # Promotions/Offers
│       │   ├── admin.js           # Admin Operations
│       │   ├── analytics.js       # Analytics Data
│       │   └── upload.js          # File Upload
│       ├── 📂 middleware/
│       │   ├── auth.js            # JWT Auth Middleware
│       │   ├── validate.js        # Input Validation
│       │   └── upload.js          # Multer Config
│       ├── 📂 services/
│       │   └── emailService.js    # Email Service (Nodemailer)
│       ├── 📂 sockets/
│       │   └── socketHandler.js   # WebSocket Handler
│       └── 📂 seeds/
│           └── seedData.js        # Database Seed Data
│
├── index.html                     # HTML Entry Point
├── vite.config.ts                 # Vite Configuration
├── tailwind.config.ts             # Tailwind Configuration
├── package.json                   # Frontend Dependencies
├── start_app.bat                  # One-click Launcher
└── .env                           # Frontend Environment Variables
```

---

## ✨ All Features

### 👤 User Features (Customer Side)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **User Registration** | Sign up with email, password, full name, phone number |
| 2 | **User Login** | Sign in with email & password |
| 3 | **JWT Authentication** | Token-based session management with auto-expiry |
| 4 | **Profile Management** | View and edit name, phone, delivery address |
| 5 | **Browse Menu** | View all food items with images, prices, descriptions |
| 6 | **Category Filtering** | Filter menu by food category |
| 7 | **Search Menu** | Search food items by name |
| 8 | **Dietary Labels** | Shows Vegetarian, Vegan, Gluten-Free, Nut-Free labels |
| 9 | **Spice Level Indicator** | Shows spice level for each dish |
| 10 | **Food Detail Modal** | Click a food item to see full details |
| 11 | **Add to Cart** | Add food items to shopping cart with quantity |
| 12 | **Shopping Cart** | View, update, remove items from cart |
| 13 | **Checkout** | Place order with delivery address and payment method |
| 14 | **Order History** | View all past orders with details |
| 15 | **Real-time Order Tracking** | Live order status updates via WebSocket |
| 16 | **Favorites** | Save/remove favorite food items |
| 17 | **Reviews & Ratings** | Rate and review food items |
| 18 | **Promotions/Offers** | View active promotions and apply promo codes |
| 19 | **Food Recommendations** | AI-based food recommendations section |
| 20 | **Dark/Light Theme** | Toggle between dark and light mode |
| 21 | **Responsive Design** | Works on desktop, tablet, and mobile |
| 22 | **Scroll Animations** | Smooth reveal animations on scroll |
| 23 | **Welcome Email** | Automated welcome email on registration (Gmail SMTP) |

### 🔐 Security Features

| # | Feature | Description |
|---|---------|-------------|
| 24 | **Password Hashing** | Bcrypt with 12 salt rounds — passwords never stored in plain text |
| 25 | **Account Lockout** | Account locked for 15 min after 5 failed login attempts |
| 26 | **Rate Limiting** | Login: 10 attempts/15 min, Registration: 5/hour per IP |
| 27 | **Login History** | Tracks IP address, browser, OS, device, timestamp for every login |
| 28 | **Failed Attempt Warnings** | Shows remaining attempts before account lock |
| 29 | **Change Password** | Change password with current password verification |
| 30 | **Password Strength Meter** | Real-time password strength indicator (Weak → Very Strong) |
| 31 | **Password Change Tracking** | Records when password was last changed |
| 32 | **Account Deletion** | Delete account with password + "DELETE" confirmation |
| 33 | **Protected Routes** | Pages like Cart, Profile require authentication |
| 34 | **Route Guards** | Admin pages restricted to admin role only |
| 35 | **Security Dashboard** | View account status, login activity, security info |
| 36 | **Input Validation** | Both client-side (Zod) and server-side (express-validator) |

### 👑 Admin Features

| # | Feature | Description |
|---|---------|-------------|
| 37 | **Admin Dashboard** | Overview with key metrics and stats |
| 38 | **Manage Menu** | Add, edit, delete, toggle availability of food items |
| 39 | **Manage Orders** | View all orders, update order status in real-time |
| 40 | **Manage Customers** | View all customers and their details |
| 41 | **Analytics** | Charts and reports for orders, revenue, popular items |
| 42 | **Image Upload** | Upload food item images via Multer |
| 43 | **Real-time Notifications** | Instant new order notifications via WebSocket |

---

## 🌐 API Endpoints (Backend REST API)

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user (rate limited: 5/hr) |
| POST | `/login` | Login with lockout protection (rate limited: 10/15min) |
| GET | `/me` | Get current user info |
| POST | `/logout` | Logout user |
| POST | `/refresh` | Refresh JWT token |
| PUT | `/change-password` | Change password |
| GET | `/login-history` | Get login activity (IP, browser, OS, device) |
| GET | `/security-info` | Get account security summary |
| DELETE | `/delete-account` | Delete account (password required) |

### Menu (`/api/menu`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all menu items (with filters) |
| GET | `/categories` | Get all categories |
| GET | `/:id` | Get single menu item |
| POST | `/` | Create menu item (admin) |
| PUT | `/:id` | Update menu item (admin) |
| PATCH | `/:id/availability` | Toggle item availability (admin) |
| DELETE | `/:id` | Delete menu item (admin) |

### Orders (`/api/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get orders (paginated) |
| GET | `/active` | Get active orders |
| GET | `/:id` | Get single order |
| POST | `/` | Place new order |
| PATCH | `/:id/cancel` | Cancel order |

### Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get user profile |
| PUT | `/profile` | Update user profile |
| GET | `/orders` | Get user's order history |
| GET | `/stats` | Get user statistics |

### Others
| Route | Description |
|-------|-------------|
| `/api/favorites` | Add, remove, toggle favorites |
| `/api/reviews` | Create, view, delete reviews |
| `/api/promotions` | View promotions, validate promo codes |
| `/api/analytics` | Get analytics data (admin) |
| `/api/admin` | Admin operations (orders, customers) |
| `/api/upload` | Image upload |

---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally on port 27017

### Quick Start
```bash
# Double-click to start both servers:
start_app.bat
```

### Manual Start
```bash
# Terminal 1: Start Backend
cd backend
npm install
npm run dev        # Runs on http://localhost:5000

# Terminal 2: Start Frontend
cd flavorhub-main
npm install
npm run dev        # Runs on http://localhost:8080

# (Optional) Seed database
cd backend
npm run seed
```

### Environment Variables
- **Frontend**: `.env` → `VITE_API_URL=http://localhost:5000/api`
- **Backend**: `backend/.env` → MongoDB URI, JWT secret, Gmail config

---

## 📊 Database Models (MongoDB Collections)

| Model | Key Fields |
|-------|------------|
| **User** | email, password (hashed), fullName, phone, address, role, loginHistory[], failedLoginAttempts, lockUntil, passwordChangedAt |
| **MenuItem** | name, description, price, category, imageUrl, isVegetarian, isVegan, isGlutenFree, spiceLevel, isAvailable |
| **Order** | user, items[], status (pending→confirmed→preparing→ready→delivered), totalAmount, deliveryAddress, paymentMethod |
| **Favorite** | user, menuItem |
| **Review** | user, menuItem, rating, comment |
| **Promotion** | name, code, discountType, discountValue, minOrderAmount, isActive, startsAt, expiresAt |

---

## 🎨 UI/UX Features

- ✅ **Dark/Light Mode** with system preference detection
- ✅ **Responsive Design** — Mobile, Tablet, Desktop
- ✅ **Scroll Reveal Animations** — Elements animate in on scroll
- ✅ **Gradient Hero Section** — Eye-catching landing page
- ✅ **Toast Notifications** — Real-time feedback for all actions
- ✅ **Loading Spinners** — Smooth loading states everywhere
- ✅ **Modal Dialogs** — Food details, order details, confirmations
- ✅ **Tab-based Navigation** — Profile tabs (Profile, Orders, Security)
- ✅ **Parallax Effects** — Smooth visual depth on scroll
- ✅ **Festival Offers Banner** — Promotional banner on home page

---

## 📝 Summary

| Aspect | Details |
|--------|---------|
| **Project Name** | FlavorHub |
| **Type** | Full-Stack Web Application |
| **Architecture** | MERN Stack (MongoDB, Express, React, Node.js) |
| **Frontend Language** | TypeScript + React |
| **Backend Language** | JavaScript + Node.js |
| **Database** | MongoDB (NoSQL) |
| **Styling** | TailwindCSS + Shadcn/UI |
| **Authentication** | JWT Token-based |
| **Real-time** | Socket.io (WebSocket) |
| **Total Pages** | 16 (11 User + 5 Admin) |
| **Total API Endpoints** | 30+ REST endpoints |
| **Total Components** | 60+ React components |
| **Security Features** | 13 (lockout, rate limit, login history, etc.) |
| **Total Features** | 43+ major features |
