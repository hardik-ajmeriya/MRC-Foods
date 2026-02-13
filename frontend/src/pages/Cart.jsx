import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get cart from localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('mrc-foods-cart');
    return savedCart ? JSON.parse(savedCart) : {};
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mrc-foods-cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/menu');
        const data = await response.json();
        if (data.success) {
          setMenuItems(data.data);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, []);

  const cartItems = Object.entries(cart).map(([itemId, quantity]) => {
    const item = menuItems.find(item => item._id === itemId);
    return item ? { ...item, quantity } : null;
  }).filter(item => item && item.quantity > 0);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceFee = 5;
  const total = subtotal + serviceFee;

  const updateQuantity = (itemId, newQuantity) => {
    const updatedCart = { ...cart };
    if (newQuantity <= 0) {
      delete updatedCart[itemId];
    } else {
      updatedCart[itemId] = newQuantity;
    }
    setCart(updatedCart);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          menuItem: item._id,
          quantity: item.quantity
        })),
        customerName: customerName.trim(),
        specialInstructions: specialInstructions.trim()
      };

      // Make API call to create order (with mock token for now)
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token' // You can implement proper auth later
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Clear cart and navigate to order status with real order data
        setCart({});
        localStorage.removeItem('mrc-foods-cart');
        navigate('/order-status', { 
          state: { 
            _id: result.data._id,
            orderNumber: result.data.orderNumber,
            customerName: result.data.customerName, 
            status: result.data.status,
            specialInstructions: result.data.specialInstructions,
            cartItems,
            total: result.data.total,
            estimatedTime: result.data.estimatedTime
          }
        });
      } else {
        alert('Failed to place order: ' + result.message);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      // Fallback to previous behavior
      setCart({});
      localStorage.removeItem('mrc-foods-cart');
      navigate('/order-status', { 
        state: { 
          orderNumber: `#MRC${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          customerName, 
          specialInstructions,
          cartItems,
          total,
          status: 'pending'
        }
      });
    }
  };

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Modern Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 sticky top-0 z-50">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-slate-800">My Cart</h1>
            <div className="w-10 h-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center px-6 py-20 max-w-md mx-auto">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl flex items-center justify-center mb-2">
              <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L17 18m-10-5v0m10 0v0" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Your cart is empty</h2>
          <p className="text-slate-500 text-center text-sm leading-relaxed mb-8">
            Looks like you haven't added any items to your cart yet. 
            Explore our delicious menu and add some tasty items!
          </p>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-slate-800">My Cart</h1>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{cartItems.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 pb-32">
        {/* Cart Items */}
        <div className="py-6 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 text-sm leading-tight mb-1">
                    {item.name}
                  </h3>
                  <p className="text-orange-600 font-bold text-lg">₹{item.price}</p>
                </div>
                
                {/* Modern Quantity Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <span className="w-8 text-center font-semibold text-slate-800 text-lg">
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Item Total */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Item Total</span>
                  <span className="font-bold text-slate-800">₹{item.price * item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-0 focus:outline-none transition-colors duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Special Instructions</label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests for your order..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-0 focus:outline-none transition-colors duration-200 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Order Summary
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Service Fee</span>
              <span>₹{serviceFee}</span>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="flex justify-between text-lg font-bold text-slate-800">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/50 p-6">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePlaceOrder}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Place Order • ₹{total}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
