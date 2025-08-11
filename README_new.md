# MRC Foods - College Canteen Food Ordering App

A modern, responsive web application for college canteen food ordering built with React, Vite, Tailwind CSS, and Firebase. Features real-time order tracking, student authentication, and a mobile-first PWA design.

## Features

- **Modern UI/UX**: Clean, mobile-first design with Swiggy-inspired theme
- **Real-time Orders**: Firebase Firestore integration for live order updates
- **Student Authentication**: Firebase Auth for secure student login
- **Progressive Web App (PWA)**: Installable app with offline capabilities
- **Responsive Design**: Optimized for mobile devices with desktop support
- **Food Categories**: Visual category selection with actual food images
- **Order Management**: Complete order flow from selection to tracking

## Tech Stack

- **Frontend**: React 19.1.0 with Vite 7.0.6
- **Styling**: Tailwind CSS 3.4.0 with PostCSS
- **Backend**: Firebase 10.0.0 (Firestore, Auth)
- **PWA**: Service Worker with App Manifest
- **Development**: ESLint, Prettier for code quality

## Application Overview

### Home Page
- Clean white background with orange/blue branding
- 4x2 grid layout for food categories
- Large square category images (96x96px)
- Interactive category selection with visual feedback
- Food item cards with images, ratings, and pricing

### Features Implemented
- Splash screen with modern gradient design
- Category-based food browsing
- Real-time image display
- Mobile-responsive layout
- Bottom navigation bar
- Search functionality (UI ready)

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
│   │   └── Home.jsx           # Main home page
│   ├── services/
│   │   └── orders.js          # Firebase order management
│   ├── styles/
│   │   └── index.css          # Global styles with Tailwind
│   ├── utils/
│   │   └── orderStatus.js     # Order status enums and flow
│   ├── App.jsx                # Main app component
│   └── main.jsx               # App entry point
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

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5174`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Firebase Configuration

### Required Services
- **Firestore Database**: For storing orders and menu items
- **Authentication**: For student login system
- **Hosting** (optional): For deployment

### Environment Variables
Create `.env.local` with your Firebase config:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Order Management

### Order Status Flow
The app uses a comprehensive order status system defined in `/src/utils/orderStatus.js`:

1. **PENDING** - Order placed, awaiting confirmation
2. **CONFIRMED** - Order confirmed by staff
3. **PREPARING** - Food being prepared
4. **READY** - Order ready for pickup
5. **COMPLETED** - Order delivered/picked up
6. **CANCELLED** - Order cancelled

### Firebase Services
- `createOrder(orderData)` - Create new order in Firestore
- `listenToOrders(callback)` - Real-time order updates
- Order schema includes: student info, items, status, timestamps

## Design System

### Color Scheme
- **Primary**: Orange (#F97316) - Swiggy-inspired
- **Secondary**: Blue (#2563EB) - MRC branding
- **Success**: Green (#10B981) - Add buttons
- **Background**: White (#FFFFFF) - Clean, modern

### Typography
- **Headers**: Bold, prominent food names
- **Body**: Clean, readable descriptions
- **Accent**: Orange pricing, ratings

### Components
- **Category Icons**: 96x96px square images with rounded corners
- **Food Cards**: Horizontal layout with image, details, and add button
- **Navigation**: Fixed bottom bar with Home/Cart/Track

## PWA Features

- **Installable**: Add to home screen capability
- **Offline Ready**: Service worker for caching
- **App-like Experience**: Full-screen, native feel
- **Fast Loading**: Optimized for mobile networks

## Development Progress

### Completed
- [x] Project setup and configuration
- [x] Tailwind CSS integration with PostCSS
- [x] Firebase services structure
- [x] Splash screen with modern design
- [x] Home page with category grid
- [x] Food item display with images
- [x] Responsive mobile-first layout
- [x] Image asset management
- [x] Category selection functionality

### In Progress
- [ ] Firebase initialization and connection
- [ ] User authentication system
- [ ] Cart functionality
- [ ] Order placement flow

### Planned Features
- [ ] Staff dashboard for order management
- [ ] Push notifications for order updates
- [ ] Payment integration
- [ ] Order history
- [ ] User profile management
- [ ] Menu management system

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

### v1.0.0 (Current)
- Initial project setup
- Home page with category selection
- Image integration and display
- Responsive mobile design
- Firebase services structure

---

**MRC Foods** - Making college dining convenient and modern!
