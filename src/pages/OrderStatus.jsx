import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';

const OrderStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Get order data from navigation state  
  const initialOrderData = location.state || null;

  // Fetch order data from API
  const fetchOrderData = async (orderNumber, orderId) => {
    try {
      console.log('Fetching order data for:', { orderNumber, orderId });
      
      // First try to get by order ID if available using the tracking endpoint
      if (orderId) {
        const response = await fetch(`http://localhost:5000/api/orders/track/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Order data fetched by ID:', data);
          if (data.success) {
            return data.order;
          }
        }
      }
      
      // Try by order number
      if (orderNumber) {
        const cleanOrderNumber = orderNumber.replace('#', '');
        const response = await fetch(`http://localhost:5000/api/orders/track/${cleanOrderNumber}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Order data fetched by number:', data);
          if (data.success) {
            return data.order;
          }
        }
      }
      
      // If no specific order provided, get the latest order from the database
      console.log('No specific order provided, fetching latest order...');
      const response = await fetch('http://localhost:5000/api/orders');
      const data = await response.json();
      console.log('All orders fetched:', data);
      
      if (data.success && data.orders && data.orders.length > 0) {
        // Get the most recent order (orders are sorted by createdAt desc)
        const latestOrder = data.orders[0];
        console.log('Using latest order:', latestOrder);
        return latestOrder;
      }
      
      throw new Error('No orders found');
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-gray-500',        // Order Placed
      'accepted': 'bg-blue-500',       // Order Accepted  
      'preparing': 'bg-orange-500',    // Preparing
      'ready': 'bg-green-500',         // Ready for Pickup
      'completed': 'bg-purple-500',    // Completed
      'cancelled': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
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

  const getStatusDescription = (status) => {
    const descriptions = {
      'pending': 'Your order has been received and is waiting for confirmation',
      'accepted': 'Restaurant has confirmed your order and will start preparing soon',
      'preparing': 'Your delicious food is being prepared by our chefs',
      'ready': 'Your order is ready! Please come to pick it up',
      'completed': 'Order completed successfully. Thank you!',
      'cancelled': 'This order has been cancelled'
    };
    return descriptions[status] || 'Processing your order...';
  };

  const getEstimatedTime = (status) => {
    const timeEstimates = {
      'pending': 20,
      'accepted': 15,
      'preparing': 10,
      'ready': 2,
      'completed': 0,
      'cancelled': 0
    };
    return timeEstimates[status] || 15;
  };

  const getProgress = (status) => {
    const progressMap = {
      'pending': 20,
      'accepted': 40,
      'preparing': 60,
      'ready': 80,
      'completed': 100,
      'cancelled': 0
    };
    return progressMap[status] || 20;
  };

  // Initialize socket connection and fetch order data
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join customer room for real-time updates
    newSocket.emit('join-room', 'customer');
    console.log('Connected to socket and joined customer room');

    // Fetch initial order data
    const loadOrderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch real order data from API
        const realOrderData = await fetchOrderData(
          initialOrderData?.orderNumber, 
          initialOrderData?._id
        );
        
        console.log('Setting real order data:', realOrderData);
        setOrderData(realOrderData);
        
      } catch (error) {
        console.log('Could not fetch order data:', error.message);
        
        // If we have initial data from navigation, use it as fallback
        if (initialOrderData) {
          console.log('Using initial order data as fallback:', initialOrderData);
          setOrderData(initialOrderData);
          setError('Could not load live order data. Showing cached information.');
        } else {
          // No initial data and no database data - show error
          console.log('No order data available');
          setError('No order data available. Please place an order first.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();

    return () => {
      newSocket.close();
    };
  }, [initialOrderData]);

  // Set up Socket.IO event listeners when orderData changes
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ No socket connection available');
      return;
    }

    console.log('🔧 Setting up Socket.IO event listeners with orderData:', orderData);

    // Listen for order status updates
    const handleOrderStatusUpdate = (updatedOrder) => {
      console.log('🔄 Received order status update:', updatedOrder);
      
      // Check if this update matches the current order we're tracking
      const isMatchingOrder = orderData && (
        updatedOrder.orderNumber === orderData.orderNumber || 
        updatedOrder._id === orderData._id ||
        (updatedOrder._id && orderData._id && updatedOrder._id.toString() === orderData._id.toString()) ||
        (initialOrderData && updatedOrder.orderNumber === initialOrderData.orderNumber)
      );
      
      console.log('🔍 Order matching check:', {
        isMatchingOrder,
        updatedOrderId: updatedOrder._id,
        updatedOrderNumber: updatedOrder.orderNumber,
        currentOrderId: orderData?._id,
        currentOrderNumber: orderData?.orderNumber,
        initialOrderNumber: initialOrderData?.orderNumber
      });
      
      if (isMatchingOrder) {
        console.log('✅ Updating order data with new status:', updatedOrder.status);
        setLastUpdate(new Date().toLocaleTimeString());
        setOrderData(prevOrder => {
          const newOrderData = {
            ...prevOrder,
            ...updatedOrder,
            status: updatedOrder.status,
            updatedAt: updatedOrder.updatedAt
          };
          console.log('📦 New order data set:', newOrderData);
          return newOrderData;
        });
      } else {
        console.log('⏸️ Order update not for current order');
      }
    };

    // Listen for new orders (in case this is a fresh order)
    const handleNewOrder = (newOrder) => {
      console.log('🆕 New order received:', newOrder);
      if (initialOrderData && newOrder.orderNumber === initialOrderData.orderNumber) {
        console.log('✅ Setting new order data');
        setOrderData(newOrder);
      }
    };

    console.log('📡 Adding Socket.IO event listeners');
    socket.on('order-status-updated', handleOrderStatusUpdate);
    socket.on('new-order', handleNewOrder);

    return () => {
      console.log('🧹 Cleaning up Socket.IO event listeners');
      socket.off('order-status-updated', handleOrderStatusUpdate);
      socket.off('new-order', handleNewOrder);
    };
  }, [socket, orderData, initialOrderData]);

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No order data available</h3>
          <p className="text-gray-500 mb-6">
            {error || 'Please place an order to see order tracking information.'}
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors duration-200"
            >
              Place Your First Order
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-6 text-white relative">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🔄</span>
            </div>
            <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <span>📡</span>
              <span>Live Tracking</span>
              {lastUpdate && <span className="text-yellow-300">• {lastUpdate}</span>}
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-1">Order Status</h1>
        <p className="text-green-100">Order {orderData.orderNumber}</p>
      </div>

      <div className="max-w-md mx-auto px-6">
        {/* Main Status Card */}
        <div className="bg-white rounded-t-3xl -mt-6 pt-12 px-8 pb-8 relative z-10">
          {/* Status Icon and Title */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 ${getStatusColor(orderData.status)} rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-500`}>
              <span className="text-4xl">{getStatusIcon(orderData.status)}</span>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{getStatusLabel(orderData.status)}</h2>
            <p className="text-gray-600 text-lg">{getStatusDescription(orderData.status)}</p>
          </div>

          {/* Progress Section */}
          {orderData.status !== 'cancelled' && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span className="font-medium">Progress</span>
                <span className="font-semibold">{getProgress(orderData.status)}% Complete</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div 
                  className={`${getStatusColor(orderData.status)} h-3 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${getProgress(orderData.status)}%` }}
                ></div>
              </div>

              {/* Time Remaining Card */}
              {orderData.status !== 'completed' && (
                <div className={`${getStatusColor(orderData.status).replace('bg-', 'bg-').replace('-500', '-50')} border-2 ${getStatusColor(orderData.status).replace('bg-', 'border-').replace('-500', '-200')} rounded-2xl p-5 flex items-center justify-center gap-3`}>
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`${getStatusColor(orderData.status).replace('bg-', 'text-').replace('-500', '-600')} font-bold text-lg`}>
                    {getEstimatedTime(orderData.status)} min remaining
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div className="bg-white px-8 py-6 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Order Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Customer Name</span>
              <span className="text-gray-900 font-semibold">{orderData.customerName}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Order ID</span>
              <span className="text-gray-900 font-semibold font-mono">{orderData.orderNumber}</span>
            </div>
            {orderData.total && (
              <div className="flex justify-between items-center py-2 border-t border-gray-100 pt-3">
                <span className="text-gray-600 font-medium">Total Amount</span>
                <span className="text-green-600 font-bold text-lg">₹{orderData.total}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Timeline Section */}
        <div className="bg-white px-8 pb-8 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6 text-xl">Order Timeline</h3>
          
          <div className="space-y-4">
            {['pending', 'accepted', 'preparing', 'ready', 'completed'].map((status, index) => {
              const currentStatusIndex = ['pending', 'accepted', 'preparing', 'ready', 'completed'].indexOf(orderData.status);
              const isCompleted = index <= currentStatusIndex && orderData.status !== 'cancelled';
              const isCurrent = index === currentStatusIndex && orderData.status !== 'cancelled';
              
              return (
                <div key={status} className={`flex items-center gap-4 p-5 rounded-2xl transition-all duration-500 ${
                  isCompleted && !isCurrent
                    ? 'bg-green-500 text-white shadow-lg' 
                    : isCurrent 
                      ? `${getStatusColor(status)} text-white shadow-lg animate-pulse`
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted && !isCurrent
                      ? 'bg-white'
                      : isCurrent
                        ? 'bg-white'
                        : 'bg-gray-200'
                  }`}>
                    {isCompleted && !isCurrent ? (
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isCurrent ? (
                      <span className={`text-2xl ${getStatusColor(status).replace('bg-', 'text-').replace('-500', '-500')}`}>
                        {getStatusIcon(status)}
                      </span>
                    ) : (
                      <span className="text-2xl text-gray-400">{getStatusIcon(status)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{getStatusLabel(status)}</h4>
                    <p className={`${
                      isCompleted && !isCurrent 
                        ? 'text-green-100'
                        : isCurrent 
                          ? 'text-white opacity-90'
                          : 'text-gray-400'
                    }`}>
                      {getStatusDescription(status)}
                    </p>
                  </div>
                  
                  {isCurrent && (
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      <span className="text-white text-sm font-medium">Current</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white px-8 pb-8 border-t border-gray-100">
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Order More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
