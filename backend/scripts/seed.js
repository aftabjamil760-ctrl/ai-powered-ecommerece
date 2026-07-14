const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const sampleProducts = [
  {
    name: 'Aethon XR 3D Ultra Gaming Laptop',
    description: 'Premium high-performance laptop with a 3D-rendered chassis, liquid cooling, and a 4K HDR display for immersive gaming and content creation.',
    price: 2799,
    discount: 12,
    category: 'Laptop',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'Nebula Pro 3D Studio VR Headset',
    description: 'Advanced virtual reality headset with ultra-wide 3D optics, motion tracking, and spatial audio for studio-quality immersive experiences.',
    price: 899,
    discount: 8,
    category: 'VR',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'Quasar RTX 6090 AI Graphics Engine',
    description: 'Next-gen graphics accelerator built for 3D rendering, AI simulation, and ray tracing at ultra-high frame rates.',
    price: 2499,
    discount: 10,
    category: 'GPU',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'Solara 8K OLED HDR Monitor',
    description: '8K OLED display with Dolby Vision HDR, variable refresh, and a designer 3D angular bezel for exceptional color and clarity.',
    price: 2199,
    discount: 15,
    category: 'Monitor',
    stock: 16,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'PulseWave Studio Noise-Cancelling Headphones',
    description: 'Studio-grade headphones with 3D spatial audio, adaptive noise cancellation, and premium leather comfort for long listening sessions.',
    price: 349,
    discount: 20,
    category: 'Audio',
    stock: 42,
    image: 'https://images.unsplash.com/photo-1519750157634-b57957386919?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'Atlas Pro Action Camera',
    description: 'Rugged 4K action camera with 3-axis stabilization, waterproof housing, and enhanced low-light capture for adventure filmmakers.',
    price: 279,
    discount: 10,
    category: 'Camera',
    stock: 27,
    image: 'https://images.unsplash.com/photo-1519183071298-a2962eadc7da?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'Vortex HyperDrive Mechanical Keyboard',
    description: 'High-end mechanical keyboard with 3D sculpted keycaps, per-key RGB, and ultra-low latency switches for pro-level typing and gaming.',
    price: 199,
    discount: 12,
    category: 'Keyboard',
    stock: 33,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'Lumina Smart Glasses AR',
    description: 'Sleek augmented reality glasses with 3D holographic overlays, voice control, and lightweight titanium frames for mobile productivity.',
    price: 1299,
    discount: 10,
    category: 'Wearables',
    stock: 10,
    image: 'https://images.unsplash.com/photo-1518349619113-4dba9ca4e8ef?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'Kronos Titan Smartwatch',
    description: 'Luxury smartwatch with 3D ceramic finish, health monitoring, and a customizable OLED display for fitness and smart notifications.',
    price: 599,
    discount: 5,
    category: 'Wearables',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1516728778615-2d590ea1856f?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'Helix 3D Printing Workstation',
    description: 'Professional 3D printer with dual-extrusion, auto-bed leveling, and a precision build volume for prototyping detailed models.',
    price: 1699,
    discount: 12,
    category: '3D Printer',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'EchoSphere AI Home Hub',
    description: 'Voice-enabled smart home hub with 3D sound, ambient lighting, and intelligent automation for the connected home ecosystem.',
    price: 149,
    discount: 18,
    category: 'Smart Home',
    stock: 55,
    image: 'https://images.unsplash.com/photo-1519052536-714cd2f2f1da?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'TitanX Drone 5 Pro',
    description: 'Premium aerial drone with 4K cinematic capture, 3D obstacle sensing, and extended flight time for professionals and enthusiasts.',
    price: 1099,
    discount: 10,
    category: 'Drone',
    stock: 14,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'Stratus Carbon Racing E-Bike',
    description: 'Lightweight electric racing bike with carbon frame, 3D-molded ergonomics, and high-torque motor for fast, efficient commutes.',
    price: 2399,
    discount: 12,
    category: 'E-Bike',
    stock: 9,
    image: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'Nebula Sonic Soundbar',
    description: 'Premium soundbar with 3D surround audio, Dolby Atmos support, and a slim glass design for cinematic home entertainment.',
    price: 499,
    discount: 15,
    category: 'Audio',
    stock: 22,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'Orion Quantum Portable SSD',
    description: 'Ultra-fast portable SSD with 3D NAND technology, military-grade durability, and encrypted storage to keep your workspace moving.',
    price: 249,
    discount: 10,
    category: 'Storage',
    stock: 48,
    image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=900&q=90'
  },
  {
    name: 'Spectra 3D Display Console',
    description: 'Immersive desktop console with a 3D interface, adaptive lighting, and precision display tuning for designers and gamers.',
    price: 1799,
    discount: 14,
    category: 'Display',
    stock: 13,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=90'
  }
];

const seedDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb+srv://aftabjamil793:bYrNwTqtJ7xiVnW0@cluster0.5ooaiii.mongodb.net/user_crud';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB for seeding...');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    await Product.insertMany(sampleProducts);
    console.log(`Inserted ${sampleProducts.length} sample products successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
