const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise-canceling technology and 40-hour battery life.",
    price: 299.99,
    discount: 15,
    category: "Electronics",
    stock: 50,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format"
  },
  {
    name: "Smart Watch Series 5",
    description: "Track your health and stay connected with this sleek and powerful smartwatch.",
    price: 399.00,
    discount: 10,
    category: "Electronics",
    stock: 30,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format"
  },
  {
    name: "Classic Leather Backpack",
    description: "Durable and stylish leather backpack, perfect for daily use and travel.",
    price: 89.99,
    discount: 0,
    category: "Accessories",
    stock: 100,
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500&auto=format"
  },
  {
    name: "Mechanical Gaming Keyboard",
    description: "RGB backlit mechanical keyboard with tactile switches for the ultimate gaming experience.",
    price: 129.50,
    discount: 20,
    category: "Electronics",
    stock: 15,
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&auto=format"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb+srv://aftabjamil793:bYrNwTqtJ7xiVnW0@cluster0.5ooaiii.mongodb.net/user_crud');
    console.log("Connected to MongoDB for seeding...");
    
    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products.");
    
    // Insert samples
    await Product.insertMany(sampleProducts);
    console.log("Inserted sample products successfully!");
    
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
