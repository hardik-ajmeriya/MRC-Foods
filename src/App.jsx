import { Routes, Route } from 'react-router-dom';
import './styles/index.css';
import Home from './pages/Home';
import Cart from './pages/Cart';
import OrderStatus from './pages/OrderStatus';
import StaffDashboard from './pages/StaffDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/order-status" element={<OrderStatus />} />
      <Route path="/staff" element={<StaffDashboard />} />
    </Routes>
  );
}

export default App;
