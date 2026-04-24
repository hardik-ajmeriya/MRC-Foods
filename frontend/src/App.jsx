import { Navigate, Route, Routes } from 'react-router-dom';
import './styles/index.css';
import Home from './pages/Home';
import Cart from './pages/Cart';
import OrderStatus from './pages/OrderStatus';
import StaffDashboard from './pages/StaffDashboard';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
