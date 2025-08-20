import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  
  // Manager login state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  // Initialize socket connection
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.emit('join-room', 'staff');
    socket.on('connect', () => setConnectionStatus('connected'));
    socket.on('new-order', data => setOrders(prev => [data, ...prev]));
    socket.on('order-status-updated', data =>
      setOrders(prev => prev.map(o => o._id === data._id ? { ...o, ...data } : o))
    );
    socket.on('connect_error', () => setConnectionStatus('disconnected'));
    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    return () => socket.close();
  }, []);

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success) setOrders(data.orders);
      else setOrders([]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    try {
      const resp = await authService.login({ email, password });
      if (resp.success && resp.user.role === 'admin') {
        setIsLoggedIn(true);
        setShowLoginModal(false);
        setEmail('');
        setPassword('');
      } else {
        setError('Invalid manager credentials');
      }
    } catch {
      setError('Login failed');
    }
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/test');
      const data = await response.json();
      alert(`Backend test: ${data.success ? 'SUCCESS' : 'FAILED'}\n${data.message}`);
    } catch (error) {
      alert(`Backend test FAILED: ${error.message}`);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrders(prev => new Set([...prev, orderId]));
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setOrders(prev => 
          prev.map(order => 
            order._id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
          )
        );
      } else {
        alert('Failed to update order status: ' + data.message);
      }
    } catch {
      alert('Error updating order status. Please try again.');
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800 border-gray-200',
      'accepted': 'bg-blue-100 text-blue-800 border-blue-200',
      'preparing': 'bg-orange-100 text-orange-800 border-orange-200',
      'ready': 'bg-green-100 text-green-800 border-green-200',
      'completed': 'bg-purple-100 text-purple-800 border-purple-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'P', 'accepted': 'A', 'preparing': 'R',
      'ready': 'RDY', 'completed': 'C', 'cancelled': 'X'
    };
    return icons[status] || 'O';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Order Placed', 'accepted': 'Order Accepted', 
      'preparing': 'Preparing', 'ready': 'Ready for Pickup',
      'completed': 'Completed', 'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'accepted', 'accepted': 'preparing',
      'preparing': 'ready', 'ready': 'completed'
    };
    return statusFlow[currentStatus];
  };

  const filterOrders = (orders) => {
    if (activeFilter === 'all') return orders;
    if (activeFilter === 'active') {
      return orders.filter(order => !['completed', 'cancelled'].includes(order.status));
    }
    return orders.filter(order => order.status === activeFilter);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-4 sm:px-6 sm:py-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Staff Dashboard</h1>
            <p className="text-green-100">Manage orders and updates</p>
            {isLoggedIn && <p className="text-green-200 text-sm">✓ Manager Access</p>}
          </div>
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              connectionStatus === 'connected' 
                ? 'bg-green-500/20 text-green-100' 
                : connectionStatus === 'disconnected'
                  ? 'bg-red-500/20 text-red-100'
                  : 'bg-yellow-500/20 text-yellow-100'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' 
                  ? 'bg-green-400 animate-pulse' 
                  : connectionStatus === 'disconnected'
                    ? 'bg-red-400'
                    : 'bg-yellow-400 animate-pulse'
              }`}></div>
              <span className="font-medium">
                {connectionStatus === 'connected' ? 'Live Updates' : 
                 connectionStatus === 'disconnected' ? 'Disconnected' : 'Connecting...'}
              </span>
            </div>
            
            {/* Manager Login Button */}
            {!isLoggedIn && (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/80 rounded-lg hover:bg-orange-500 transition-colors duration-200"
              >
                👤 Manager Login
              </button>
            )}
            
            <button 
              onClick={testBackendConnection}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/80 rounded-lg hover:bg-blue-500 transition-colors duration-200"
            >
              Test API
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
            >
              🏠 Home
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto mt-4 sm:mt-0">
          {['all', 'active', 'pending', 'accepted', 'preparing', 'ready', 'completed'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                activeFilter === filter
                  ? 'bg-white text-green-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {filter === 'all' ? 'All Orders' :
               filter === 'active' ? 'Active Orders' :
               getStatusLabel(filter)}
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {filter === 'all' ? orders.length : 
                 filter === 'active' ? orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length :
                 orders.filter(o => o.status === filter).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-2 py-4 sm:px-6 sm:py-6 space-y-4">
        {filterOrders(orders).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">Orders will appear here when customers place them.</p>
          </div>
        ) : (
          filterOrders(orders).map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.customerName} • {formatTime(order.createdAt)}
                  </p>
                </div>
                <div className="text-left sm:text-right mt-2 sm:mt-0">
                  <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border-2 ${getStatusColor(order.status)}`}>
                    <span className="mr-2 text-lg">{getStatusIcon(order.status)}</span>
                    {getStatusLabel(order.status)}
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-2">₹{order.total}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-100 pt-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                <div className="space-y-1 sm:space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">
                        {item.menuItem?.name || 'Item'} × {item.quantity}
                      </span>
                      <span className="font-medium">₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Special Instructions:</span> {order.specialInstructions}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row gap-2">
                  {getNextStatus(order.status) && (
                    <button
                      onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                      disabled={updatingOrders.has(order._id)}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                        updatingOrders.has(order._id)
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {updatingOrders.has(order._id) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <span className="text-lg">{getStatusIcon(getNextStatus(order.status))}</span>
                          Move to {getStatusLabel(getNextStatus(order.status))}
                        </>
                      )}
                    </button>
                  )}
                  
                  {order.status !== 'cancelled' && order.status !== 'completed' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'cancelled')}
                      disabled={updatingOrders.has(order._id)}
                      className={`px-4 py-3 border rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
                        updatingOrders.has(order._id)
                          ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                          : 'border-red-300 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      {updatingOrders.has(order._id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      ) : (
                        <>
                          <span>❌</span>
                          Cancel
                        </>
                      )}
                    </button>
                  )}
                  
                  {order.status === 'completed' && (
                    <div className="flex-1 bg-gray-100 text-gray-500 px-4 py-3 rounded-lg font-medium text-center">
                      Order Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manager Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Manager Login</h2>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <img src="/canteen.png" alt="Canteen" className="w-16 h-16 mx-auto mb-4" />
            
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:border-green-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:border-green-500"
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
            >
              Login
            </button>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Test: admin@mrcfoods.com / password123
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
