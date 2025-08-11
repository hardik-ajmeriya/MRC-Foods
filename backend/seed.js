const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mrc_foods');
    console.log('📊 Connected to MongoDB for seeding');

    // Clear existing data
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create Categories
    const categories = await Category.insertMany([
      {
        name: 'Biryani',
        icon: '🍛',
        image: '/food_dishes/Biryani.jpg',
        description: 'Aromatic rice dishes with spices',
        sortOrder: 1
      },
      {
        name: 'Chinese',
        icon: '🥡',
        image: '/food_dishes/Chinese.jpg',
        description: 'Asian cuisine favorites',
        sortOrder: 2
      },
      {
        name: 'Burger',
        icon: '🍔',
        image: '/food_dishes/Burger.jpg',
        description: 'Juicy burgers and sandwiches',
        sortOrder: 3
      },
      {
        name: 'Pizza',
        icon: '🍕',
        image: '/food_dishes/Pizza.jpg',
        description: 'Wood-fired pizzas',
        sortOrder: 4
      },
      {
        name: 'North Indian',
        icon: '🍛',
        image: '/food_dishes/North%20Indian.jpg',
        description: 'Traditional North Indian dishes',
        sortOrder: 5
      },
      {
        name: 'Rolls',
        icon: '🌯',
        image: '/food_dishes/Rolls.jpg',
        description: 'Wraps and rolls',
        sortOrder: 6
      },
      {
        name: 'Cake',
        icon: '🎂',
        image: '/food_dishes/Cake.jpg',
        description: 'Fresh baked cakes',
        sortOrder: 7
      },
      {
        name: 'Ice Cream',
        icon: '🍨',
        image: '/food_dishes/Ice%20Cream.jpg',
        description: 'Cool treats and desserts',
        sortOrder: 8
      }
    ]);

    console.log('📁 Categories created');

    // Create Menu Items
    const menuItems = [
      // Biryani
      {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender chicken pieces and authentic spices',
        price: 180,
        image: '/food_dishes/Biryani.jpg',
        category: categories[0]._id,
        rating: 4.5,
        prepTime: '25 min',
        isVeg: false,
        ingredients: ['Basmati Rice', 'Chicken', 'Onions', 'Yogurt', 'Spices'],
        popularity: 95
      },
      {
        name: 'Veg Biryani',
        description: 'Fragrant rice with mixed vegetables and aromatic spices',
        price: 150,
        image: '/food_dishes/Biryani.jpg',
        category: categories[0]._id,
        rating: 4.3,
        prepTime: '20 min',
        isVeg: true,
        ingredients: ['Basmati Rice', 'Mixed Vegetables', 'Onions', 'Spices'],
        popularity: 80
      },
      // Chinese
      {
        name: 'Hakka Noodles',
        description: 'Stir-fried noodles with fresh vegetables and soy sauce',
        price: 120,
        image: '/food_dishes/Chinese.jpg',
        category: categories[1]._id,
        rating: 4.2,
        prepTime: '15 min',
        isVeg: true,
        ingredients: ['Noodles', 'Vegetables', 'Soy Sauce', 'Garlic'],
        popularity: 75
      },
      {
        name: 'Fried Rice',
        description: 'Wok-tossed rice with vegetables and authentic Chinese flavors',
        price: 110,
        image: '/food_dishes/Chinese.jpg',
        category: categories[1]._id,
        rating: 4.1,
        prepTime: '12 min',
        isVeg: true,
        ingredients: ['Rice', 'Vegetables', 'Soy Sauce', 'Spring Onions'],
        popularity: 70
      },
      // Burger
      {
        name: 'Chicken Burger',
        description: 'Crispy chicken patty with fresh lettuce and special sauce',
        price: 140,
        image: '/food_dishes/Burger.jpg',
        category: categories[2]._id,
        rating: 4.4,
        prepTime: '10 min',
        isVeg: false,
        ingredients: ['Chicken Patty', 'Bun', 'Lettuce', 'Tomato', 'Sauce'],
        popularity: 85
      },
      {
        name: 'Veg Burger',
        description: 'Fresh vegetables patty with cheese and crispy bun',
        price: 100,
        image: '/food_dishes/Burger.jpg',
        category: categories[2]._id,
        rating: 4.0,
        prepTime: '8 min',
        isVeg: true,
        ingredients: ['Veg Patty', 'Bun', 'Cheese', 'Lettuce', 'Sauce'],
        popularity: 65
      },
      // Pizza
      {
        name: 'Margherita Pizza',
        description: 'Classic tomato and mozzarella cheese pizza',
        price: 200,
        image: '/food_dishes/Pizza.jpg',
        category: categories[3]._id,
        rating: 4.6,
        prepTime: '18 min',
        isVeg: true,
        ingredients: ['Pizza Base', 'Tomato Sauce', 'Mozzarella', 'Basil'],
        popularity: 90
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni with cheese on crispy base',
        price: 250,
        image: '/food_dishes/Pizza.jpg',
        category: categories[3]._id,
        rating: 4.5,
        prepTime: '20 min',
        isVeg: false,
        ingredients: ['Pizza Base', 'Tomato Sauce', 'Pepperoni', 'Cheese'],
        popularity: 88
      },
      // North Indian
      {
        name: 'Dal Makhani',
        description: 'Creamy black lentils cooked with butter and spices',
        price: 120,
        image: '/food_dishes/North%20Indian.jpg',
        category: categories[4]._id,
        rating: 4.3,
        prepTime: '15 min',
        isVeg: true,
        ingredients: ['Black Lentils', 'Butter', 'Cream', 'Spices'],
        popularity: 78
      },
      {
        name: 'Paneer Butter Masala',
        description: 'Rich cottage cheese curry in tomato-based gravy',
        price: 160,
        image: '/food_dishes/North%20Indian.jpg',
        category: categories[4]._id,
        rating: 4.4,
        prepTime: '18 min',
        isVeg: true,
        ingredients: ['Paneer', 'Tomato', 'Cream', 'Butter', 'Spices'],
        popularity: 82
      },
      // Rolls
      {
        name: 'Chicken Roll',
        description: 'Spiced chicken wrapped in soft roti with chutneys',
        price: 80,
        image: '/food_dishes/Rolls.jpg',
        category: categories[5]._id,
        rating: 4.2,
        prepTime: '8 min',
        isVeg: false,
        ingredients: ['Chicken', 'Roti', 'Onions', 'Chutneys'],
        popularity: 72
      },
      {
        name: 'Paneer Roll',
        description: 'Grilled paneer with mint chutney in fresh roti',
        price: 70,
        image: '/food_dishes/Rolls.jpg',
        category: categories[5]._id,
        rating: 4.0,
        prepTime: '7 min',
        isVeg: true,
        ingredients: ['Paneer', 'Roti', 'Mint Chutney', 'Onions'],
        popularity: 60
      },
      // Cake
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate sponge cake with chocolate frosting',
        price: 60,
        image: '/food_dishes/Cake.jpg',
        category: categories[6]._id,
        rating: 4.5,
        prepTime: '5 min',
        isVeg: true,
        ingredients: ['Chocolate Sponge', 'Chocolate Frosting', 'Cocoa'],
        popularity: 85
      },
      {
        name: 'Vanilla Cake',
        description: 'Classic vanilla flavored cake with cream frosting',
        price: 50,
        image: '/food_dishes/Cake.jpg',
        category: categories[6]._id,
        rating: 4.2,
        prepTime: '5 min',
        isVeg: true,
        ingredients: ['Vanilla Sponge', 'Cream Frosting', 'Vanilla Extract'],
        popularity: 70
      },
      // Ice Cream
      {
        name: 'Vanilla Ice Cream',
        description: 'Creamy vanilla ice cream made with real vanilla beans',
        price: 40,
        image: '/food_dishes/Ice%20Cream.jpg',
        category: categories[7]._id,
        rating: 4.3,
        prepTime: '2 min',
        isVeg: true,
        ingredients: ['Milk', 'Cream', 'Vanilla', 'Sugar'],
        popularity: 75
      },
      {
        name: 'Chocolate Ice Cream',
        description: 'Rich chocolate ice cream with cocoa and chocolate chips',
        price: 45,
        image: '/food_dishes/Ice%20Cream.jpg',
        category: categories[7]._id,
        rating: 4.4,
        prepTime: '2 min',
        isVeg: true,
        ingredients: ['Milk', 'Cream', 'Chocolate', 'Cocoa', 'Sugar'],
        popularity: 80
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log('🍽️ Menu items created');

    // Create default users
    const saltRounds = 12;
    const defaultPassword = await bcrypt.hash('password123', saltRounds);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@mrcfoods.com',
        password: defaultPassword,
        role: 'admin',
        phone: '9999999999'
      },
      {
        name: 'Staff Member',
        email: 'staff@mrcfoods.com',
        password: defaultPassword,
        role: 'staff',
        phone: '9999999998'
      },
      {
        name: 'John Student',
        email: 'student@mrcfoods.com',
        password: defaultPassword,
        role: 'student',
        studentId: 'MRC2024001',
        phone: '9999999997'
      }
    ];

    await User.insertMany(users);
    console.log('👥 Default users created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@mrcfoods.com / password123');
    console.log('Staff: staff@mrcfoods.com / password123');
    console.log('Student: student@mrcfoods.com / password123');

    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
