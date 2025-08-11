import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, disconnected
  const [updatingOrders, setUpdatingOrders] = useState(new Set()); // Track which orders are being updated

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');

    // Join staff room for real-time updates
    newSocket.emit('join-room', 'staff');
    console.log('Connected to socket and joined staff room');

    // Handle successful connection
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setConnectionStatus('connected');
    });

    // Listen for new orders
    newSocket.on('new-order', (orderData) => {
      console.log('New order received:', orderData);
      setOrders(prev => [orderData, ...prev]);
    });

    // Listen for order status updates
    newSocket.on('order-status-updated', (updatedOrder) => {
      console.log('Order status updated via socket:', updatedOrder);
      setOrders(prev => 
        prev.map(order => 
          order._id === updatedOrder._id ? {
            ...order,
            ...updatedOrder,
            status: updatedOrder.status,
            updatedAt: updatedOrder.updatedAt
          } : order
        )
      );
    });

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionStatus('disconnected');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionStatus('disconnected');
    });

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.close();
    };
  }, []);

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders from API...');
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Orders data received:', data);
      
      if (data.success) {
        setOrders(data.orders);
        console.log('Orders set to state:', data.orders.length, 'orders');
      } else {
        console.error('API returned error:', data.message);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', error.message);
      setOrders([]);
    } finally {
      setLoading(false);
      console.log('Fetch orders completed, loading set to false');
    }
  };

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch('http://localhost:5000/api/orders/test');
      const data = await response.json();
      console.log('Test response:', data);
      alert(`Backend test: ${data.success ? 'SUCCESS' : 'FAILED'}\n${data.message}`);
    } catch (error) {
      console.error('Test failed:', error);
      alert(`Backend test FAILED: ${error.message}`);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('Updating order status:', { orderId, newStatus });
      
      // Add to updating set
      setUpdatingOrders(prev => new Set([...prev, orderId]));
      
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      console.log('Status update response:', data);
      
      if (data.success) {
        console.log('Order status updated successfully');
        
        // Update local state immediately for responsive UI
        setOrders(prev => 
          prev.map(order => 
            order._id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
          )
        );
        
        // Note: Socket.IO broadcasting is handled by the backend automatically
        // when the status update API is called. No need to emit from frontend.
        
      } else {
        console.error('Failed to update order status:', data.message);
        alert('Failed to update order status: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status. Please try again.');
    } finally {
      // Remove from updating set
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800 border-gray-200',        // Order Placed
      'accepted': 'bg-blue-100 text-blue-800 border-blue-200',      // Order Accepted  
      'preparing': 'bg-orange-100 text-orange-800 border-orange-200', // Preparing
      'ready': 'bg-green-100 text-green-800 border-green-200',      // Ready for Pickup
      'completed': 'bg-purple-100 text-purple-800 border-purple-200', // Completed
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'P',      // Order Placed
      'accepted': 'A',     // Order Accepted
      'preparing': 'R',    // Preparing
      'ready': 'RDY',      // Ready for Pickup
      'completed': 'C',    // Completed
      'cancelled': 'X'     // Cancelled
    };
    return icons[status] || 'O';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Order Placed',
      'accepted': 'Order Accepted', 
      'preparing': 'Preparing',
      'ready': 'Ready for Pickup',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'accepted',    // Order Placed → Order Accepted
      'accepted': 'preparing',  // Order Accepted → Preparing
      'preparing': 'ready',     // Preparing → Ready for Pickup
      'ready': 'completed'      // Ready for Pickup → Completed
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
      hour: '2-digit',
      minute: '2-digit'
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
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Staff Dashboard</h1>
            <p className="text-green-100">Manage orders and updates</p>
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
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
      <div className="px-6 py-6 space-y-4">
        {filterOrders(orders).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">No Orders</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">Orders will appear here when customers place them.</p>
          </div>
        ) : (
          filterOrders(orders).map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.customerName} • {formatTime(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
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
                <div className="space-y-2">
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Special Instructions:</span> {order.specialInstructions}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100">
                {/* Status Progress Timeline */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Order Timeline</span>
                    <span>{getStatusLabel(order.status)}</span>
                  </div>
                  <div className="flex items-center">
                    {['pending', 'accepted', 'preparing', 'ready', 'completed'].map((status, index) => {
                      const isActive = order.status === status;
                      const isCompleted = ['pending', 'accepted', 'preparing', 'ready', 'completed'].indexOf(order.status) >= index;
                      const isLast = index === 4;
                      
                      return (
                        <div key={status} className="flex items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors duration-200 ${
                            isActive 
                              ? 'bg-green-500 text-white border-green-500' 
                              : isCompleted 
                                ? 'bg-green-100 text-green-600 border-green-200'
                                : 'bg-gray-100 text-gray-400 border-gray-200'
                          }`}>
                            {getStatusIcon(status)}
                          </div>
                          {!isLast && (
                            <div className={`flex-1 h-1 mx-2 rounded transition-colors duration-200 ${
                              isCompleted && !isActive ? 'bg-green-200' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Placed</span>
                    <span>Accepted</span>
                    <span>Preparing</span>
                    <span>Ready</span>
                    <span>Done</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
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
                          <span>X</span>
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
    </div>
  );
};

export default StaffDashboard;
