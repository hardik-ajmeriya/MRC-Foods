# MRC Foods - College Canteen Food Ordering App

A modern, professional web application for college canteen food ordering built with React, Vite, Tailwind CSS, and Firebase. Features real-time order tracking, student authentication, staff dashboard, and a mobile-first PWA design.

## Features

- **Professional UI/UX**: Clean, mobile-first design with professional styling
- **Real-time Orders**: Socket.IO integration for instant order updates
- **Staff Dashboard**: Complete order management system for canteen staff
- **Order Tracking**: Live order status updates for customers
- **Student Authentication**: Firebase Auth for secure student login
- **Progressive Web App (PWA)**: Installable app with offline capabilities
- **Responsive Design**: Optimized for mobile devices with desktop support
- **Food Categories**: Visual category selection with actual food images
- **Order Management**: Complete order flow from selection to tracking

## Tech Stack

- **Frontend**: React 19.1.0 with Vite 7.0.6
- **Styling**: Tailwind CSS 3.4.0 with PostCSS
- **Real-time**: Socket.IO for live updates
- **Backend**: Node.js with Express and MongoDB
- **Authentication**: Firebase Auth
- **PWA**: Service Worker with App Manifest
- **Development**: ESLint, Prettier for code quality

## Application Overview

### Home Page
- Clean white background with professional branding
- 4x2 grid layout for food categories
- Large square category images (96x96px)
- Interactive category selection with visual feedback
- Food item cards with images, ratings, and pricing

### Staff Dashboard
- Professional order management interface
- Real-time order status updates
- Order filtering and search capabilities
- Status tracking with progress indicators
- Connection status monitoring

### Customer Order Tracking
- Live order status updates without page refresh
- Professional timeline visualization
- Progress tracking with completion percentages
- Real-time notifications of status changes
- Mobile-optimized tracking interface

### Features Implemented
- Splash screen with modern gradient design
- Category-based food browsing
- Real-time Socket.IO integration
- Mobile-responsive layout
- Professional UI without emoji distractions
- Staff and customer role separation

## Project Structure

```
MRC_Foods/
├── public/
│   ├── food_dishes/           # Food category images
│   │   ├── Biryani.jpg
│   │   ├── Chinese.jpg
│   │   ├── Burger.jpg
│   │   ├── Pizza.jpg
│   │   ├── North Indian.jpg
│   │   ├── Rolls.jpg
│   │   ├── Cake.jpg
│   │   └── Ice Cream.jpg
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
├── src/
│   ├── components/            # Reusable UI components
│   ├── pages/
│   │   ├── Splash.jsx         # App splash screen
│   │   ├── Home.jsx           # Main home page
│   │   ├── StaffDashboard.jsx # Staff order management dashboard
│   │   └── OrderStatus.jsx    # Customer order tracking page
│   ├── services/
│   │   └── orders.js          # Firebase order management
│   ├── styles/
│   │   └── index.css          # Global styles with Tailwind
│   ├── utils/
│   │   └── orderStatus.js     # Order status enums and flow
│   ├── App.jsx                # Main app component with routing
│   └── main.jsx               # App entry point
├── backend/                   # Node.js backend server
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── middleware/           # Custom middleware
│   └── server.js            # Express server with Socket.IO
├── .env.example               # Environment variables template
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.cjs         # PostCSS configuration
├── vite.config.js             # Vite build configuration
└── package.json               # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MRC_Foods
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Firebase configuration to `.env.local`

4. **Start backend server**
   ```bash
   cd backend
   npm install
   npm start
   ```

5. **Start frontend development server**
   ```bash
   cd .. 
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:5174`

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

**Backend:**
- `npm start` - Start Express server with Socket.IO
- `npm run dev` - Start server with nodemon for development

## Configuration

### Backend Setup
The application requires both MongoDB and Socket.IO server:

**Backend Environment Variables (backend/.env):**
```env
MONGODB_URI=mongodb://localhost:27017/mrc_foods
PORT=5000
NODE_ENV=development
```

**Socket.IO Configuration:**
- Real-time communication between staff dashboard and customer tracking
- Room-based updates (staff room, customer room)
- Automatic order status broadcasting
- Connection status monitoring

### Firebase Configuration (Optional)

**Frontend Environment Variables (.env.local):**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Order Management System

### Order Status Flow
The app uses a professional order status system with real-time updates:

1. **PENDING** - Order placed, awaiting staff confirmation
2. **ACCEPTED** - Order confirmed by staff, preparation starting
3. **PREPARING** - Food being prepared by kitchen staff
4. **READY** - Order ready for customer pickup
5. **COMPLETED** - Order successfully delivered/picked up
6. **CANCELLED** - Order cancelled by staff or system

### Real-time Features
- **Socket.IO Integration**: Instant status updates across all connected clients
- **Staff Dashboard**: Live order management with status controls
- **Customer Tracking**: Real-time progress updates without page refresh
- **Connection Monitoring**: Visual indicators for live update status
- **Professional UI**: Clean interface without emoji distractions

### API Endpoints
- `GET /api/orders` - Retrieve all orders
- `GET /api/orders/track/:id` - Track specific order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders` - Create new order
- Real-time Socket.IO events for instant updates

## Design System

### Color Scheme
- **Primary**: Green (#10B981) - Professional, clean branding
- **Secondary**: Blue (#2563EB) - Action buttons and highlights
- **Success**: Green variations for completed states
- **Warning**: Orange/Yellow for pending states
- **Error**: Red for cancelled/error states
- **Background**: White (#FFFFFF) - Clean, professional appearance

### Typography
- **Headers**: Bold, professional styling without decorative elements
- **Body**: Clean, readable descriptions and content
- **Status Indicators**: Clear, text-based status representations
- **Buttons**: Professional action labels without emoji distractions

### Professional Components
- **Status Icons**: Text-based abbreviations (P, A, R, RDY, C, X)
- **Progress Indicators**: Clean percentage-based progress bars
- **Connection Status**: Professional "Live Updates" indicators
- **Action Buttons**: Clear, descriptive button text
- **Navigation**: Clean, text-based navigation elements

## PWA Features

- **Installable**: Add to home screen capability
- **Offline Ready**: Service worker for caching
- **App-like Experience**: Full-screen, native feel
- **Fast Loading**: Optimized for mobile networks

## Development Progress

### Completed
- [x] Project setup and configuration
- [x] Tailwind CSS integration with PostCSS
- [x] Backend server with Express and MongoDB
- [x] Socket.IO real-time communication system
- [x] Staff Dashboard with order management
- [x] Customer Order Tracking with live updates
- [x] Professional UI design without emoji distractions
- [x] Order status flow with real-time updates
- [x] Responsive mobile-first layout
- [x] Connection status monitoring
- [x] Error handling and loading states

### In Progress
- [ ] Firebase authentication integration
- [ ] Menu management system
- [ ] Customer cart functionality
- [ ] Payment integration setup

### Planned Features
- [ ] Push notifications for order updates
- [ ] Advanced order filtering and search
- [ ] Order history and analytics
- [ ] Staff role management
- [ ] Customer feedback system
- [ ] Inventory management
- [ ] Reporting and analytics dashboard

## Technical Details

### Build Configuration
- **Vite**: Fast build tool with HMR
- **ESM/CommonJS**: Proper module handling
- **Asset Optimization**: Image compression and lazy loading
- **Code Splitting**: Optimized bundle sizes

### Styling Approach
- **Mobile-First**: Responsive design from 320px up
- **Utility Classes**: Tailwind for consistent styling
- **Component-Based**: Reusable style patterns
- **Theme System**: Consistent color and spacing

### Performance Optimizations
- **Image Loading**: Optimized asset delivery
- **Bundle Splitting**: Code splitting for faster loads
- **Caching Strategy**: Service worker implementation
- **Lazy Loading**: On-demand component loading

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Use ESLint and Prettier configurations
- Follow React best practices
- Maintain mobile-first responsive design
- Write meaningful commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Version History

### v2.0.0 (Current)
- Professional UI redesign with emoji removal
- Real-time Socket.IO integration
- Staff Dashboard implementation
- Customer Order Tracking system
- Backend server with Express and MongoDB
- Live status updates and connection monitoring

### v1.0.0
- Initial project setup
- Home page with category selection
- Image integration and display
- Responsive mobile design
- Firebase services structure

---

**MRC Foods** - Making college dining convenient and modern!
