# FlavorHub Backend API

A complete Node.js + Express + MongoDB backend API for the FlavorHub restaurant application.

## 🚀 Features

- **JWT Authentication** - Secure login/register with token-based auth
- **Role-Based Access Control** - Admin and user roles
- **RESTful API** - Complete CRUD operations for all resources
- **Real-time Updates** - Socket.io for live order tracking
- **MongoDB Database** - Flexible document storage with Mongoose ODM

## 📦 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Local or Atlas)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Validation**: express-validator

## 🛠️ Installation

### Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)

### Setup Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your settings
   ```

4. **Start MongoDB** (if using local)
   ```bash
   # Windows
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
   
   # Or start MongoDB as a service
   ```

5. **Seed the database** (optional but recommended)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔐 Default Login Credentials

After running `npm run seed`:

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@flavorhub.com    | admin123    |
| Customer | customer@example.com   | customer123 |

## 📚 API Endpoints

### Authentication
| Method | Endpoint                | Description           |
|--------|-------------------------|-----------------------|
| POST   | /api/auth/register      | Register new user     |
| POST   | /api/auth/login         | Login user            |
| GET    | /api/auth/me            | Get current user      |
| POST   | /api/auth/logout        | Logout user           |
| POST   | /api/auth/refresh       | Refresh token         |
| PUT    | /api/auth/change-password | Change password     |

### Menu Items
| Method | Endpoint                     | Description                |
|--------|------------------------------|----------------------------|
| GET    | /api/menu                    | Get all menu items         |
| GET    | /api/menu/categories         | Get all categories         |
| GET    | /api/menu/:id                | Get single item            |
| POST   | /api/menu                    | Create item (Admin)        |
| PUT    | /api/menu/:id                | Update item (Admin)        |
| PATCH  | /api/menu/:id/availability   | Toggle availability (Admin)|
| DELETE | /api/menu/:id                | Delete item (Admin)        |

### Orders
| Method | Endpoint                | Description            |
|--------|-------------------------|------------------------|
| GET    | /api/orders             | Get user's orders      |
| GET    | /api/orders/active      | Get active orders      |
| GET    | /api/orders/:id         | Get order details      |
| POST   | /api/orders             | Create new order       |
| PATCH  | /api/orders/:id/cancel  | Cancel order           |

### Favorites
| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | /api/favorites                  | Get user's favorites |
| GET    | /api/favorites/ids              | Get favorite IDs     |
| POST   | /api/favorites/:menuItemId      | Add to favorites     |
| DELETE | /api/favorites/:menuItemId      | Remove from favorites|
| POST   | /api/favorites/:menuItemId/toggle | Toggle favorite    |

### Promotions
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | /api/promotions           | Get active promotions    |
| GET    | /api/promotions/all       | Get all (Admin)          |
| POST   | /api/promotions/validate  | Validate promo code      |
| POST   | /api/promotions           | Create promo (Admin)     |
| PUT    | /api/promotions/:id       | Update promo (Admin)     |
| DELETE | /api/promotions/:id       | Delete promo (Admin)     |

### Reviews
| Method | Endpoint                    | Description             |
|--------|-----------------------------|-----------------------  |
| GET    | /api/reviews/menu/:itemId   | Get item reviews        |
| GET    | /api/reviews/user           | Get user's reviews      |
| POST   | /api/reviews/:menuItemId    | Create/update review    |
| DELETE | /api/reviews/:reviewId      | Delete review           |

### Admin
| Method | Endpoint                        | Description            |
|--------|---------------------------------|------------------------|
| GET    | /api/admin/orders               | Get all orders         |
| PATCH  | /api/admin/orders/:id/status    | Update order status    |
| GET    | /api/admin/customers            | Get all customers      |
| GET    | /api/admin/customers/:id        | Get customer details   |
| POST   | /api/admin/users                | Create admin user      |

### Analytics
| Method | Endpoint               | Description           |
|--------|------------------------|-----------------------|
| GET    | /api/analytics         | Get full analytics    |
| GET    | /api/analytics/summary | Get quick summary     |

## 🔌 Socket.io Events

### Client to Server
- `track-order` - Start tracking an order
- `untrack-order` - Stop tracking an order
- `subscribe-admin-orders` - Subscribe to admin updates

### Server to Client
- `order-update` - Order status changed
- `new-order` - New order received (admin)
- `order-status-changed` - Status update broadcast

## 🔧 Environment Variables

| Variable       | Description                         | Default                              |
|----------------|-------------------------------------|--------------------------------------|
| MONGODB_URI    | MongoDB connection string           | mongodb://localhost:27017/flavorhub  |
| JWT_SECRET     | Secret key for JWT signing          | (required)                           |
| JWT_EXPIRES_IN | Token expiration time               | 7d                                   |
| PORT           | Server port                         | 5000                                 |
| NODE_ENV       | Environment mode                    | development                          |
| FRONTEND_URL   | Frontend URL for CORS               | http://localhost:5173                |

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── validate.js       # Request validation
│   ├── models/
│   │   ├── User.js           # User model
│   │   ├── MenuItem.js       # Menu item model
│   │   ├── Order.js          # Order model
│   │   ├── Favorite.js       # Favorite model
│   │   ├── Promotion.js      # Promotion model
│   │   ├── Review.js         # Review model
│   │   └── index.js          # Model exports
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   ├── menu.js           # Menu routes
│   │   ├── orders.js         # Order routes
│   │   ├── users.js          # User routes
│   │   ├── favorites.js      # Favorites routes
│   │   ├── promotions.js     # Promotions routes
│   │   ├── reviews.js        # Reviews routes
│   │   ├── analytics.js      # Analytics routes
│   │   └── admin.js          # Admin routes
│   ├── sockets/
│   │   └── socketHandler.js  # Socket.io handler
│   ├── seeds/
│   │   └── seedData.js       # Database seeder
│   └── server.js             # Main entry point
├── .env                      # Environment variables
├── .env.example              # Example env file
└── package.json              # Dependencies
```

## 🧪 Testing the API

You can test the API using tools like:
- [Postman](https://www.postman.com/)
- [Thunder Client](https://www.thunderclient.com/) (VS Code extension)
- cURL

Example login request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flavorhub.com","password":"admin123"}'
```

## 📄 License

MIT License
