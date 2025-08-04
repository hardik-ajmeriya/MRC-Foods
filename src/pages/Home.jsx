import React, { useState } from 'react';

// Use public folder images with proper URLs
const biryaniImg = 'http://localhost:5174/food_dishes/Biryani.jpg';
const chineseImg = 'http://localhost:5174/food_dishes/Chinese.jpg';
const burgerImg = 'http://localhost:5174/food_dishes/Burger.jpg';
const pizzaImg = 'http://localhost:5174/food_dishes/Pizza.jpg';
const northIndianImg = 'http://localhost:5174/food_dishes/North%20Indian.jpg';
const rollsImg = 'http://localhost:5174/food_dishes/Rolls.jpg';
const cakeImg = 'http://localhost:5174/food_dishes/Cake.jpg';
const iceCreamImg = 'http://localhost:5174/food_dishes/Ice%20Cream.jpg';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('Biryani');

  // Categories with actual food images
  const categories = [
    {
      name: 'Biryani',
      icon: biryaniImg,
      items: [
        { id: 1, name: 'Chicken Biryani', description: 'Aromatic basmati rice with chicken', price: 180, rating: 4.5, time: '25 min', image: biryaniImg },
        { id: 2, name: 'Veg Biryani', description: 'Fragrant rice with mixed vegetables', price: 150, rating: 4.3, time: '20 min', image: biryaniImg }
      ]
    },
    {
      name: 'Chinese',
      icon: chineseImg,
      items: [
        { id: 3, name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables', price: 120, rating: 4.2, time: '15 min', image: chineseImg },
        { id: 4, name: 'Fried Rice', description: 'Wok-tossed rice with soy sauce', price: 110, rating: 4.1, time: '12 min', image: chineseImg }
      ]
    },
    {
      name: 'Burger',
      icon: burgerImg,
      items: [
        { id: 5, name: 'Chicken Burger', description: 'Crispy chicken patty with lettuce', price: 140, rating: 4.4, time: '10 min', image: burgerImg },
        { id: 6, name: 'Veg Burger', description: 'Fresh vegetables with cheese', price: 100, rating: 4.0, time: '8 min', image: burgerImg }
      ]
    },
    {
      name: 'Pizza',
      icon: pizzaImg,
      items: [
        { id: 7, name: 'Margherita Pizza', description: 'Classic tomato and mozzarella', price: 200, rating: 4.6, time: '18 min', image: pizzaImg },
        { id: 8, name: 'Pepperoni Pizza', description: 'Spicy pepperoni with cheese', price: 250, rating: 4.5, time: '20 min', image: pizzaImg }
      ]
    },
    {
      name: 'North Indian',
      icon: northIndianImg,
      items: [
        { id: 9, name: 'Dal Makhani', description: 'Creamy black lentils', price: 120, rating: 4.3, time: '15 min', image: northIndianImg },
        { id: 10, name: 'Paneer Butter Masala', description: 'Rich cottage cheese curry', price: 160, rating: 4.4, time: '18 min', image: northIndianImg }
      ]
    },
    {
      name: 'Rolls',
      icon: rollsImg,
      items: [
        { id: 11, name: 'Chicken Roll', description: 'Spiced chicken wrapped in roti', price: 80, rating: 4.2, time: '8 min', image: rollsImg },
        { id: 12, name: 'Paneer Roll', description: 'Grilled paneer with mint chutney', price: 70, rating: 4.0, time: '7 min', image: rollsImg }
      ]
    },
    {
      name: 'Cake',
      icon: cakeImg,
      items: [
        { id: 13, name: 'Chocolate Cake', description: 'Rich chocolate sponge cake', price: 60, rating: 4.5, time: '5 min', image: cakeImg },
        { id: 14, name: 'Vanilla Cake', description: 'Classic vanilla flavored cake', price: 50, rating: 4.2, time: '5 min', image: cakeImg }
      ]
    },
    {
      name: 'Ice Cream',
      icon: iceCreamImg,
      items: [
        { id: 15, name: 'Vanilla Ice Cream', description: 'Creamy vanilla ice cream', price: 40, rating: 4.3, time: '2 min', image: iceCreamImg },
        { id: 16, name: 'Chocolate Ice Cream', description: 'Rich chocolate ice cream', price: 45, rating: 4.4, time: '2 min', image: iceCreamImg }
      ]
    }
  ];

  const getCurrentItems = () => {
    const category = categories.find(cat => cat.name === activeCategory);
    return category ? category.items : [];
  };

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
                {category.icon.startsWith('http') || category.icon.startsWith('/') ? (
                  <img 
                    src={category.icon} 
                    alt={category.name}
                    className="w-full h-full object-cover rounded-lg"
                    onLoad={() => console.log('Image loaded:', category.icon)}
                    onError={(e) => {
                      console.log('Image failed to load:', category.icon);
                      console.log('Error:', e);
                    }}
                  />
                ) : (
                  <span className="text-2xl">{category.icon}</span>
                )}
              </div>
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
          {getCurrentItems().map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {item.image.startsWith('http') || item.image.startsWith('/') ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                    onLoad={() => console.log('Food image loaded:', item.image)}
                    onError={(e) => {
                      console.log('Food image failed to load:', item.image);
                      console.log('Error:', e);
                    }}
                  />
                ) : (
                  <span className="text-2xl">{item.image}</span>
                )}
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
              
              <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          <div className="flex flex-col items-center py-2">
            <span className="text-orange-500 text-xl">🏠</span>
            <span className="text-xs text-orange-500 font-medium">Home</span>
          </div>
          <div className="flex flex-col items-center py-2">
            <span className="text-gray-400 text-xl">🛒</span>
            <span className="text-xs text-gray-400">Cart</span>
          </div>
          <div className="flex flex-col items-center py-2">
            <span className="text-gray-400 text-xl">📍</span>
            <span className="text-xs text-gray-400">Track</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
