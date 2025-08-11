# MRC Foods - MERN Stack Setup Guide

## 🚀 Project Overview

MRC Foods is now a full-stack MERN (MongoDB, Express.js, React, Node.js) application for college canteen food ordering.

## 📁 Project Structure

```
MRC_Foods/
├── backend/                 # Express.js API server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── server.js           # Express server
│   ├── seed.js            # Database seeding
│   └── package.json       # Backend dependencies
├── src/                    # React frontend
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   └── main.jsx          # React entry point
├── public/               # Static assets
└── package.json         # Frontend dependencies
```

## 🛠️ Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

## 📦 Installation

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Setup

#### Backend Environment (.env)
Create `backend/.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/mrc_foods
JWT_SECRET=mrc_foods_super_secret_key_2024
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MRC Foods
```

### 3. Database Setup

#### Start MongoDB
```bash
# Windows (if MongoDB service is not running)
net start MongoDB

# macOS/Linux
brew services start mongodb-community
# or
sudo systemctl start mongod
```

#### Seed the Database
```bash
npm run backend:seed
```

This will create:
- Sample categories and menu items
- Default user accounts:
  - Admin: `admin@mrcfoods.com` / `password123`
  - Staff: `staff@mrcfoods.com` / `password123`
  - Student: `student@mrcfoods.com` / `password123`

## 🚀 Running the Application

### Development Mode (Both Frontend & Backend)
```bash
npm run dev:full
```

### Separate Commands
```bash
# Frontend only (http://localhost:5173)
npm run dev

# Backend only (http://localhost:5000)
npm run backend:dev
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item (Admin/Staff)
- `PUT /api/menu/:id` - Update menu item (Admin/Staff)
- `DELETE /api/menu/:id` - Delete menu item (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin/Staff)
- `PUT /api/categories/:id` - Update category (Admin/Staff)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders` - Get all orders (Staff/Admin)
- `PATCH /api/orders/:id/status` - Update order status (Staff/Admin)
- `PATCH /api/orders/:id/cancel` - Cancel order

### Users
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/profile` - Update user profile
- `PATCH /api/users/:id/role` - Update user role (Admin)
- `PATCH /api/users/:id/deactivate` - Deactivate user (Admin)

## 👥 User Roles

### Student
- Browse menu items
- Place orders
- View order history
- Update profile

### Staff
- All student permissions
- View all orders
- Update order status
- Manage menu items
- Manage categories

### Admin
- All staff permissions
- Manage users
- Delete menu items/categories
- Full system access

## 🔒 Authentication

The app uses JWT (JSON Web Tokens) for authentication:
- Tokens are stored in localStorage
- Protected routes require valid tokens
- Tokens expire after 7 days

## 📱 Frontend Features

- **Responsive Design**: Mobile-first approach
- **Interactive UI**: Modern animations and transitions
- **Real-time Updates**: Order status polling
- **Category Navigation**: Easy food browsing
- **Cart Management**: Add/remove items with animations
- **Order Tracking**: Real-time order status

## 🗄️ Database Schema

### Users
- Personal information, role-based access
- Authentication credentials
- Student ID for students

### Categories
- Food categories with images and icons
- Sorting and activation status

### Menu Items
- Detailed food information
- Pricing, ratings, preparation time
- Ingredients and nutritional info
- Popularity tracking

### Orders
- Order details and status tracking
- Customer information
- Payment status
- Special instructions

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, DigitalOcean, or AWS

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to Vercel, Netlify, or any static hosting

## 🔧 Development Scripts

```bash
# Frontend development
npm run dev

# Backend development
npm run backend:dev

# Full stack development
npm run dev:full

# Database seeding
npm run backend:seed

# Code formatting
npm run format

# Linting
npm run lint

# Production build
npm run build
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple commands

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests if applicable
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

---

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env

2. **CORS Errors**
   - Verify FRONTEND_URL in backend .env
   - Check API_URL in frontend .env

3. **Authentication Issues**
   - Clear localStorage and login again
   - Check JWT_SECRET configuration

4. **Port Conflicts**
   - Frontend: Change in vite.config.js
   - Backend: Change PORT in .env

### Getting Help

- Check the console for error messages
- Verify environment variables
- Ensure all dependencies are installed
- Check MongoDB connection status
