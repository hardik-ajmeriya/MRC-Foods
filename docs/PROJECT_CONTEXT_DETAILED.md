# MRC Foods Project Context (Detailed)

## 1) Project Identity
MRC Foods is a college canteen food-ordering application with a React + Vite + Tailwind frontend and a Node.js + Express + MongoDB backend. The current implementation focuses on:
- Menu browsing by category
- Cart and checkout flow
- Real-time order tracking for customers
- Real-time staff dashboard for order management

The codebase also contains Firebase-oriented service code, but active runtime behavior is primarily REST + Socket.IO with MongoDB.

## 2) Current Architecture

### Frontend
- Stack: React 19, React Router, Tailwind CSS, Socket.IO client
- Entry app routes:
  - / (Home)
  - /cart (Cart)
  - /order-status (Customer tracking)
  - /staff (Staff dashboard)

### Backend
- Stack: Express, Mongoose, JWT auth middleware, Helmet, CORS, rate limiting, Socket.IO
- API base: /api
- Server also exposes Socket.IO events for real-time order updates

### Data layer
- MongoDB with Mongoose models:
  - User
  - Category
  - MenuItem
  - Order

## 3) Repository Structure (High-value paths)
- frontend/src/pages: Core customer and staff screens
- frontend/src/services: API wrappers and auth helpers
- backend/server.js: App bootstrap, middleware, Socket.IO wiring
- backend/routes: REST endpoints
- backend/models: Mongoose schemas
- docs: Setup and product/technical docs

## 4) User Flows Implemented

### Customer flow
1. Open Home and fetch categories + menu from backend
2. Add/remove items from cart (stored in localStorage)
3. Place order from cart with customer name and optional instructions
4. Navigate to Order Status page
5. Receive live status updates via Socket.IO

### Staff flow
1. Open staff dashboard
2. Receive new orders in real time
3. Move status along lifecycle (pending -> accepted -> preparing -> ready -> completed)
4. Customers on tracking page see updates instantly

## 5) Frontend Behavior Details

### Home screen
- Fetches:
  - GET http://localhost:5000/api/menu
  - GET http://localhost:5000/api/categories
- Uses active category filter client-side
- Stores cart quantity map in localStorage key: mrc-foods-cart

### Cart screen
- Reads cart from localStorage and resolves item details from /api/menu
- Posts order to backend:
  - POST http://localhost:5000/api/orders
- On success, clears cart and routes to /order-status with order payload in navigation state

### Order status screen
- Attempts to fetch order by:
  - /api/orders/track/:id
  - /api/orders/track/:orderNumber
  - fallback to latest order from /api/orders
- Joins Socket.IO room: customer
- Listens for:
  - order-status-updated
  - new-order

### Staff dashboard
- Fetches all orders from /api/orders
- Joins Socket.IO room: staff
- Listens for:
  - new-order
  - order-status-updated
- Updates order status using:
  - PUT /api/orders/:id/status

## 6) Backend API Surface (Current)

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (auth required)
- POST /api/auth/logout (auth required)

### Menu
- GET /api/menu
- GET /api/menu/:id
- POST /api/menu (auth + admin/staff)
- PUT /api/menu/:id (auth + admin/staff)
- DELETE /api/menu/:id (auth + admin)

### Categories
- GET /api/categories
- GET /api/categories/:id
- POST /api/categories (auth + admin/staff)
- PUT /api/categories/:id (auth + admin/staff)
- DELETE /api/categories/:id (auth + admin)

### Orders
- GET /api/orders/test
- POST /api/orders
- GET /api/orders/my-orders (auth)
- GET /api/orders/track/:id
- GET /api/orders/:id (auth)
- PATCH /api/orders/:id/status (auth + non-student)
- PATCH /api/orders/:id/cancel (auth)
- PUT /api/orders/:id/status (currently used by staff page)
- GET /api/orders

### Users
- GET /api/users (auth + admin)
- PUT /api/users/profile (auth)
- PATCH /api/users/:id/role (auth + admin)
- PATCH /api/users/:id/deactivate (auth + admin)

## 7) Real-time Event Contract

### Rooms
- staff
- customer

### Events emitted from backend
- new-order
- order-status-updated

### Typical real-time lifecycle
1. Customer places order (POST /api/orders)
2. Backend emits new-order to staff and customer rooms
3. Staff updates order status (PUT /api/orders/:id/status)
4. Backend emits order-status-updated to both rooms
5. Customer Order Status page updates UI progress immediately

## 8) Data Model Snapshot

### User
- name, email, password, role (student/staff/admin), studentId, phone, isActive, lastLogin

### Category
- name, icon, image, description, isActive, sortOrder

### MenuItem
- name, description, price, image, category ref, rating, prepTime, availability flags, metadata

### Order
- orderNumber
- customer ref + customerName
- items[] (menuItem ref, quantity, price, subtotal)
- subtotal, serviceFee, total
- status, paymentStatus, paymentMethod
- specialInstructions, estimatedTime, completedAt, isActive

## 9) Auth and Security
- JWT-based auth middleware from Authorization: Bearer <token>
- Helmet enabled
- Rate limiting enabled (100 requests per 15 minutes per IP)
- CORS configured with FRONTEND_URL env
- Password hashing with bcryptjs (salt rounds: 12)

## 10) Environment and Run Commands

### Backend environment (minimum)
- MONGODB_URI
- JWT_SECRET
- PORT
- FRONTEND_URL

### Frontend environment (minimum)
- VITE_API_URL

### Common run commands
- frontend: npm run dev
- backend dev: npm run backend:dev
- full stack: npm run dev:full
- seed database: npm run backend:seed

## 11) Current Technical Reality and Gaps

### 1. Hybrid backend direction (MongoDB + leftover Firebase service)
There is Firebase order wrapper code in frontend services, but page-level flows are currently using REST endpoints and Socket.IO against the Node backend.

### 2. Order status naming inconsistency
Two status vocabularies appear in code/docs:
- accepted (used by model, staff page, customer page)
- confirmed (used in one PATCH endpoint validation and some docs)
This can cause validation or documentation confusion.

### 3. Duplicate order-status update endpoints
Both exist:
- PATCH /api/orders/:id/status (auth-aware, expects confirmed vocabulary)
- PUT /api/orders/:id/status (used by staff UI, expects accepted vocabulary)
Unifying into one authoritative endpoint would reduce drift.

### 4. Placeholder auth behavior during checkout
Cart currently sends a mock bearer token during order placement while the order creation route itself does not require auth. This is functional for demo flow but not a finalized production contract.

### 5. Minor UI class typos present
Some className values in Home page include malformed Tailwind token strings (for example text:white, bg:white), which may reduce styling reliability in those elements.

## 12) If You Use This as Prompt Context
Use this project context when asking assistants for changes:
- Target stack: React + Vite + Tailwind frontend, Express + MongoDB backend
- Preserve real-time behavior using existing Socket.IO events/rooms
- Respect current route contracts unless explicitly refactoring
- Treat status flow normalization as a cross-cutting concern if touching orders
- Keep mobile-first UX as primary constraint

## 13) Key Source References
- frontend/src/App.jsx
- frontend/src/pages/Home.jsx
- frontend/src/pages/Cart.jsx
- frontend/src/pages/OrderStatus.jsx
- frontend/src/pages/StaffDashboard.jsx
- frontend/src/services/api.js
- frontend/src/services/auth.js
- backend/server.js
- backend/routes/orders.js
- backend/routes/auth.js
- backend/routes/menu.js
- backend/routes/categories.js
- backend/routes/users.js
- backend/models/Order.js
- backend/models/User.js
- backend/models/MenuItem.js
- backend/models/Category.js
