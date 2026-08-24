import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './styles/index.css';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import FoodDetails from './pages/FoodDetails';
import Cart from './pages/Cart';
import OrderStatus from './pages/OrderStatus';
import StaffDashboard from './pages/StaffDashboard';
import Dashboard from './pages/Dashboard';
import Foods from './pages/Foods';
import Categories from './pages/Categories';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { useFoodStore } from './store/useFoodStore';

function App() {
  const startRealtime = useFoodStore((state) => state.startRealtime);
  const stopRealtime = useFoodStore((state) => state.stopRealtime);

  useEffect(() => {
    startRealtime();
    return () => stopRealtime();
  }, [startRealtime, stopRealtime]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/category/:categoryName" element={<CategoryPage />} />
      <Route path="/food/:id" element={<FoodDetails />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-status"
        element={
          <ProtectedRoute>
            <OrderStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={['staff', 'admin']}>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['staff', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/foods"
        element={
          <ProtectedRoute roles={['staff', 'admin']}>
            <Foods />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/categories"
        element={
          <ProtectedRoute roles={['staff', 'admin']}>
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/orders"
        element={
          <ProtectedRoute roles={['staff', 'admin']}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-food"
        element={
          <ProtectedRoute roles={['staff', 'admin']}>
            <Foods />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
