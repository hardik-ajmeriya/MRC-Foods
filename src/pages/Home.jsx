import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Default category images for fallback
const defaultImages = {
  biryani: '/food_dishes/Biryani.jpg',
  chinese: '/food_dishes/Chinese.jpg',
  burger: '/food_dishes/Burger.jpg',
  pizza: '/food_dishes/Pizza.jpg',
  'north indian': '/food_dishes/North%20Indian.jpg',
  rolls: '/food_dishes/Rolls.jpg',
  cake: '/food_dishes/Cake.jpg',
  'ice cream': '/food_dishes/Ice%20Cream.jpg'
};

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Biryani');
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get cart from localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('mrc-foods-cart');
    return savedCart ? JSON.parse(savedCart) : {};
  });
  
  const [clickedButton, setClickedButton] = useState(null); // Track clicked button for animation

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mrc-foods-cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch menu items and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuResponse, categoriesResponse] = await Promise.all([
          fetch('http://localhost:5000/api/menu'),
          fetch('http://localhost:5000/api/categories')
        ]);
        
        const menuData = await menuResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        if (menuData.success) {
          setMenuItems(menuData.data);
        }
        
        if (categoriesData.success) {
          setCategories(categoriesData.data);
          if (categoriesData.data.length > 0) {
            setActiveCategory(categoriesData.data[0].name);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to hardcoded data if API fails
        setCategories([
          { name: 'Biryani', icon: defaultImages.biryani },
          { name: 'Chinese', icon: defaultImages.chinese },
          { name: 'Burger', icon: defaultImages.burger },
          { name: 'Pizza', icon: defaultImages.pizza }
        ]);
        setActiveCategory('Biryani');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getCurrentItems = () => {
    if (!menuItems.length) return [];
    return menuItems.filter(item => item.category?.name === activeCategory);
  };

  const getCategoryIcon = (categoryName) => {
    const normalizedName = categoryName?.toLowerCase();
    return defaultImages[normalizedName] || defaultImages.biryani;
  };

  // Cart functionality
  const addToCart = (itemId) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    
    // Trigger animation
    setClickedButton(`add-${itemId}`);
    setTimeout(() => setClickedButton(null), 200);
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
    
    // Trigger animation
    setClickedButton(`remove-${itemId}`);
    setTimeout(() => setClickedButton(null), 200);
  };

  const getItemCount = (itemId) => {
    return cart[itemId] || 0;
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, count) => total + count, 0);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleTrackClick = () => {
    navigate('/order-status');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold">
              <span className="text-orange-500">MRC</span>{' '}
              <span className="text-blue-600">Foods</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/staff')}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors duration-200"
            >
              Staff
            </button>
            <div className="relative">
              <span className="text-gray-600">🔔</span>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">H</span>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <span className="text-gray-500 mr-2">☰</span>
            <input
              type="text"
              placeholder="Search For Food"
              className="flex-1 bg-transparent outline-none text-gray-700"
            />
            <span className="text-gray-500">🔍</span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setActiveCategory(category.name)}
            >
              <div className={`w-24 h-24 rounded-lg flex items-center justify-center mb-2 overflow-hidden ${
                activeCategory === category.name ? 'bg-orange-100 ring-2 ring-orange-300' : 'bg-gray-100'
              }`}>
                <img 
                  src={category.icon || getCategoryIcon(category.name)} 
                  alt={category.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = getCategoryIcon(category.name);
                  }}
                />
              </div>
              <span className={`text-xs font-medium text-center ${
                activeCategory === category.name ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {category.name}
              </span>
            </div>
          ))}
        </div>

        {/* Category Title with Items Count */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            🥪 {activeCategory}
          </h2>
          <span className="text-sm text-gray-500">
            {getCurrentItems().length} Items Available
          </span>
        </div>

        {/* Food Items */}
        <div className="space-y-4 pb-20">
          {getCurrentItems().length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items available</h3>
              <p className="text-gray-500">Items for {activeCategory} will appear here when available.</p>
            </div>
          ) : (
            getCurrentItems().map((item) => (
            <div key={item._id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={item.image || getCategoryIcon(item.category?.name)} 
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = getCategoryIcon(item.category?.name);
                  }}
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-orange-400">⭐</span>
                    <span className="text-sm font-medium">{item.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">🕐</span>
                    <span className="text-sm text-gray-600">{item.time}</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-orange-600">₹ {item.price}</span>
              </div>
              
              {getItemCount(item._id) === 0 ? (
                <button 
                  onClick={() => addToCart(item._id)}
                  className={`bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium 
                           hover:from-green-600 hover:to-green-700 transform hover:scale-105 active:scale-95 
                           transition-all duration-200 shadow-md hover:shadow-lg border-0 
                           flex items-center gap-1 min-w-[70px] justify-center text-sm
                           ${clickedButton === `add-${item._id}` ? 'scale-125 shadow-xl' : ''}`}
                >
                  <span>+</span>
                  <span>Add</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 rounded-lg px-2 py-2 shadow-md">
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    className={`text-white text-lg font-bold hover:bg-white hover:bg-opacity-20 rounded px-2 py-0.5 
                             transition-all duration-200 transform hover:scale-110 active:scale-95
                             ${clickedButton === `remove-${item._id}` ? 'scale-125 bg-white bg-opacity-30' : ''}`}
                  >
                    −
                  </button>
                  <span className="text-white font-medium text-sm min-w-[20px] text-center px-1">
                    {getItemCount(item._id)}
                  </span>
                  <button 
                    onClick={() => addToCart(item._id)}
                    className={`text-white text-lg font-bold hover:bg-white hover:bg-opacity-20 rounded px-2 py-0.5 
                             transition-all duration-200 transform hover:scale-110 active:scale-95
                             ${clickedButton === `add-${item._id}` ? 'scale-125 bg-white bg-opacity-30' : ''}`}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          <div className="flex flex-col items-center py-2">
            <span className="text-orange-500 text-xl">🏠</span>
            <span className="text-xs text-orange-500 font-medium">Home</span>
          </div>
          <div 
            className="flex flex-col items-center py-2 cursor-pointer hover:bg-gray-50 px-4 rounded-lg transition-colors relative"
            onClick={handleCartClick}
          >
            <span className="text-gray-400 text-xl">🛒</span>
            <span className="text-xs text-gray-400">Cart</span>
            {getTotalItems() > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </div>
            )}
          </div>
          <div 
            className="flex flex-col items-center py-2 cursor-pointer hover:bg-gray-50 px-4 rounded-lg transition-colors"
            onClick={handleTrackClick}
          >
            <span className="text-gray-400 text-xl">📍</span>
            <span className="text-xs text-gray-400">Track</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
