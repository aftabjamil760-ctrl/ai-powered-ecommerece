const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../config/database');
const Product = require('../models/Product');
const vectorStore = require('../chatbot/utils/vectorStore');

async function seedProducts() {
  try {
    await connectDB();
    await vectorStore.initialize();

    const products = [
      {
        name: 'Premium Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
        price: 149.99,
        discount: 15,
        category: 'Electronics',
        stock: 50,
        image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg'
      },
      {
        name: 'Smart Fitness Tracker',
        description: 'Track your fitness goals with this advanced smart band featuring heart rate monitor and GPS.',
        price: 89.99,
        discount: 10,
        category: 'Electronics',
        stock: 75,
        image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg'
      },
      {
        name: 'Organic Cotton T-Shirt',
        description: 'Comfortable and sustainable t-shirt made from 100% organic cotton.',
        price: 29.99,
        discount: 5,
        category: 'Clothing',
        stock: 100,
        image: 'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg'
      },
      {
        name: 'Stainless Steel Water Bottle',
        description: 'Eco-friendly water bottle with double-wall insulation and leak-proof design.',
        price: 24.99,
        discount: 0,
        category: 'Home & Kitchen',
        stock: 80,
        image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg'
      }
    ];

    for (const productData of products) {
      // Check if product exists
      const existing = await Product.findOne({ name: productData.name });
      if (existing) {
        console.log(`Product "${productData.name}" already exists, updating...`);
        await Product.updateOne({ _id: existing._id }, productData);
        await vectorStore.updateProduct(existing);
      } else {
        const product = new Product(productData);
        await product.save();
        await vectorStore.indexProduct(product);
        console.log(`Added product: ${productData.name}`);
      }
    }

    console.log('✅ Products seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();