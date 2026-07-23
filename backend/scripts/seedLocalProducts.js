const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const categories = [
  { slug: 'men', name: 'Men' },
  { slug: 'women', name: 'Women' },
  { slug: 'kids', name: 'Kids' },
  { slug: 'footwear', name: 'Footwear' },
  { slug: 'accessories', name: 'Accessories' },
  { slug: 'travel-essentials', name: 'Travel Essentials' },
  { slug: 'beach-collection', name: 'Beach Collection' },
];

const getProductImage = (category, index = 0, w = 900, h = 900) => {
  const pools = {
    men: [
      '1490114538077-0a7f8cb49891',
      '1516826957135-700dedea698c',
      '1520975916090-3105956dac38',
      '1483985988355-763728e1935b',
      '1495121605193-b116b5b9c5fe',
      '1520975954732-35dd22299614',
      '1516257984-b1b4d707412e',
      '1552374196-1ab2a1c593e8',
      '1519415943484-9fa1873496d4',
      '1516826957135-700dedea698c',
    ],
    women: [
      '1515886657613-9f3515b0c78f',
      '1502716119720-b23a93e5fe1b',
      '1524504388940-b1c1722653e1',
      '1469334031218-e382a71b716b',
      '1479064555552-3ef4979f8908',
      '1503342217505-b0a15ec3261c',
      '1521572163474-6864f9cf17ab',
      '1554568218-0f1715e72254',
      '1583743814966-8936f5b7be1a',
      '1594633312681-425c7b97ccd1',
    ],
    kids: [
      '1519457431-44ccd64a579b',
      '1503944583220-79d8926ad5e2',
      '1622290291468-a28f7a7dc4ff',
      '1518831959646-742c3a14ebf7',
      '1596755094514-f87e34085b2a',
      '1519689680058-324335c77eba',
      '1519415943484-9fa1873496d4',
      '1522771930-78848d9293e8',
      '1503944583220-79d8926ad5e2',
      '1519457431-44ccd64a579b',
    ],
    footwear: [
      '1542291026-7eec264c27ff',
      '1595950653106-6c9ebd614d3a',
      '1600185365483-26d7a4cc7519',
      '1560769629-975ec94e6a86',
      '1571945153237-4929e783af30',
      '1560343090-f0409e92791a',
      '1520639888713-7851133b1ed0',
      '1449505078894-f6a1e6b3ff4c',
      '1491553895911-0055eca6402d',
      '1512374382149-233c42b6a83b',
    ],
    accessories: [
      '1441986300917-64674bd600d8',
      '1509631179647-0177331693ae',
      '1591047139829-d91aecb6caea',
      '1591348278863-a8fb388e2aa',
      '1523381210434-271e8be1f52b',
      '1553062407-98eeb64c6a62',
      '1508296695146-257a814070d4',
      '1523275335684-37898b6baf30',
      '1560343090-f0409e92791a',
      '1590736969955-71cc94901144',
    ],
    'travel-essentials': [
      '1533681904393-9ab6eee7e408',
      '1502877338535-766e1452684a',
      '1512436991641-6745cdb1723f',
      '1553062407-98eeb64c6a62',
      '1521572267360-ee0c2909d518',
      '1520639888713-7851133b1ed0',
      '1445205170230-053b83016050',
      '1519741497674-611481863552',
      '1590736969955-71cc94901144',
      '1449505078894-f6a1e6b3ff4c',
    ],
    'beach-collection': [
      '1519415943484-9fa1873496d4',
      '1502716119720-b23a93e5fe1b',
      '1520975916090-3105956dac38',
      '1483985988355-763728e1935b',
      '1524504388940-b1c1722653e1',
      '1583744946564-b52ac1c389c8',
      '1445205170230-053b83016050',
      '1594633312681-425c7b97ccd1',
      '1502877338535-766e1452684a',
      '1512436991641-6745cdb1723f',
    ],
  };

  const pool = pools[category] || pools.women;
  const imageId = pool[index % pool.length] || pool[0];
  return `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
};

let idCounter = 1;
const perCategoryIndex = {};
const makeProduct = (category, name, price, discount, keywords, rating = 4.6, stock = 'In Stock') => {
  const idx = (perCategoryIndex[category] = (perCategoryIndex[category] ?? -1) + 1);
  return {
    id: idCounter++,
    name,
    description: `Premium SummerNest ${category} product designed for daily summer wear.`,
    category,
    price,
    discount,
    oldPrice: discount ? Math.round(price / (1 - discount / 100)) : null,
    stock: typeof stock === 'number' ? stock : stock === 'In Stock' ? 10 : 0,
    image: getProductImage(category, idx),
    rating,
  };
};

const products = [
  makeProduct('men', 'Linen Summer Shorts', 49, 20, 'men linen shorts'),
  makeProduct('men', 'Cotton Crew T-Shirt', 29, 15, 'men white tshirt'),
  makeProduct('men', 'Breezy Linen Shirt', 79, 25, 'men linen shirt'),
  makeProduct('men', 'Utility Cargo Shorts', 65, 10, 'men cargo shorts'),
  makeProduct('men', 'Tailored Chino Pants', 89, 0, 'men chino pants'),
  makeProduct('men', 'Tropical Beach Shirt', 59, 30, 'men hawaiian shirt'),
  makeProduct('men', 'Classic Polo Shirt', 45, 0, 'men polo shirt'),
  makeProduct('men', 'Coastal Running Shoes', 129, 20, 'men running shoes'),
  makeProduct('men', 'Leather Slide Sandals', 55, 0, 'men leather sandals'),
  makeProduct('men', 'Aviator Sunglasses', 89, 15, 'men aviator sunglasses'),
  makeProduct('women', 'Cotton Summer Kurti', 69, 20, 'women kurti'),
  makeProduct('women', 'Floral Midi Dress', 99, 25, 'women floral dress'),
  makeProduct('women', 'Boxy Cotton Top', 39, 10, 'women cotton top'),
  makeProduct('women', 'Oversized Linen Shirt', 79, 15, 'women linen shirt'),
  makeProduct('women', 'High-Waist Denim Shorts', 59, 0, 'women denim shorts'),
  makeProduct('women', 'Wide-Leg Summer Pants', 89, 20, 'women summer pants'),
  makeProduct('women', 'Braided Sandals', 75, 15, 'women braided sandals'),
  makeProduct('women', 'Soft Ballet Flats', 65, 0, 'women ballet flats'),
  makeProduct('women', 'Woven Straw Handbag', 95, 10, 'straw handbag'),
  makeProduct('women', 'Oversized Sunglasses', 79, 20, 'women sunglasses'),
  makeProduct('kids', 'Kids Graphic T-Shirt', 22, 15, 'kids tshirt'),
  makeProduct('kids', 'Kids Play Shorts', 25, 0, 'kids shorts'),
  makeProduct('kids', 'Kids Linen Shirt', 32, 10, 'kids shirt'),
  makeProduct('kids', 'Kids Cotton Pants', 29, 0, 'kids pants'),
  makeProduct('kids', 'Kids Summer Sneakers', 45, 20, 'kids sneakers'),
  makeProduct('kids', 'Kids Beach Sandals', 28, 15, 'kids sandals'),
  makeProduct('kids', 'Kids Bucket Cap', 19, 0, 'kids cap'),
  makeProduct('kids', 'Kids Adventure Backpack', 39, 10, 'kids backpack'),
  makeProduct('kids', 'Kids Water Bottle', 15, 0, 'kids water bottle'),
  makeProduct('kids', 'Kids Round Sunglasses', 18, 20, 'kids sunglasses'),
  makeProduct('footwear', 'Cloud Runner Shoes', 139, 15, 'running shoes'),
  makeProduct('footwear', 'Everyday Casual Shoes', 99, 0, 'casual shoes'),
  makeProduct('footwear', 'Pool Slides', 39, 20, 'pool slides'),
  makeProduct('footwear', 'Leather Sandals', 79, 10, 'leather sandals'),
  makeProduct('footwear', 'Retro Sneakers', 119, 25, 'retro sneakers'),
  makeProduct('footwear', 'Classic Flip Flops', 19, 0, 'flip flops'),
  makeProduct('footwear', 'Beach Sandals', 45, 15, 'beach sandals'),
  makeProduct('footwear', 'Trail Sports Shoes', 149, 20, 'sports shoes'),
  makeProduct('footwear', 'Canvas Low-Tops', 69, 0, 'canvas shoes'),
  makeProduct('footwear', 'Suede Slip-Ons', 89, 10, 'slip on shoes'),
  makeProduct('accessories', 'Polarized Sunglasses', 89, 15, 'polarized sunglasses'),
  makeProduct('accessories', 'Baseball Cap', 25, 0, 'baseball cap'),
  makeProduct('accessories', 'Wide-Brim Sun Hat', 45, 10, 'sun hat'),
  makeProduct('accessories', 'Minimalist Watch', 149, 20, 'minimalist watch'),
  makeProduct('accessories', 'Weekend Travel Bag', 129, 25, 'travel bag'),
  makeProduct('accessories', 'City Backpack', 99, 0, 'city backpack'),
  makeProduct('accessories', 'Woven Leather Belt', 55, 15, 'leather belt'),
  makeProduct('accessories', 'Bifold Wallet', 65, 0, 'leather wallet'),
  makeProduct('accessories', 'Insulated Water Bottle', 29, 10, 'water bottle'),
  makeProduct('accessories', 'Turkish Beach Towel', 39, 20, 'beach towel'),
  makeProduct('travel-essentials', 'Weekender Duffel Bag', 139, 20, 'duffel bag'),
  makeProduct('travel-essentials', 'Memory Foam Neck Pillow', 29, 15, 'neck pillow'),
  makeProduct('travel-essentials', 'Leather Passport Holder', 35, 0, 'passport holder'),
  makeProduct('travel-essentials', 'Cable & Travel Organizer', 25, 10, 'travel organizer'),
  makeProduct('travel-essentials', 'Carry-On Backpack', 149, 25, 'carry on backpack'),
  makeProduct('travel-essentials', 'Hanging Toiletry Bag', 45, 0, 'toiletry bag'),
  makeProduct('travel-essentials', 'Cooling Travel Towel', 22, 15, 'cooling towel'),
  makeProduct('travel-essentials', 'Compact Travel Umbrella', 35, 0, 'travel umbrella'),
  makeProduct('travel-essentials', 'Collapsible Water Bottle', 25, 10, 'collapsible water bottle'),
  makeProduct('travel-essentials', 'Lightweight Travel Shoes', 109, 20, 'travel shoes'),
  makeProduct('beach-collection', 'Quick-Dry Beach Shorts', 45, 15, 'beach shorts'),
  makeProduct('beach-collection', 'Tropical Swimwear', 65, 20, 'swimwear'),
  makeProduct('beach-collection', 'Linen Beach Shirt', 69, 10, 'beach shirt'),
  makeProduct('beach-collection', 'Vacation Flip Flops', 22, 0, 'flip flops beach'),
  makeProduct('beach-collection', 'Woven Beach Hat', 39, 15, 'beach hat'),
  makeProduct('beach-collection', 'Round Beach Sunglasses', 55, 20, 'beach sunglasses'),
  makeProduct('beach-collection', 'Woven Beach Bag', 79, 10, 'beach bag'),
  makeProduct('beach-collection', 'Striped Beach Towel', 35, 0, 'striped beach towel'),
  makeProduct('beach-collection', 'Chilled Water Bottle', 29, 15, 'insulated water bottle'),
  makeProduct('beach-collection', 'Sunscreen Care Kit', 49, 20, 'sunscreen'),
];

const seedDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb+srv://aftabjamil793:bYrNwTqtJ7xiVnW0@cluster0.5ooaiii.mongodb.net/user_crud';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB for seeding...');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    await Product.insertMany(products);
    console.log(`Inserted ${products.length} local products successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
