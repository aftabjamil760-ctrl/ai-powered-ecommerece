// scripts/view-analytics.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// فرض کریں آپ کے اینالیٹکس یا آرڈر ماڈل کا نام Order ہے
// اگر پاتھ مختلف ہو تو اپنے پروجیکٹ کے مطابق ایڈجسٹ کر لیں
const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

async function checkDashboard() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("📊 Fetching Admin Live Analytics...\n");

    // 1. ٹوٹل آرڈرز اور ریونیو کا حساب (اسٹرائپ پیمنٹس کے بعد)
    const orders = await Order.find({});
    const totalOrders = orders.length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || order.price || 0), 0);

    // 2. انوینٹری / اسٹاک کی صورتحال چیک کرنا
    const products = await Product.find({}, 'name stock price');

    console.log("=========================================");
    console.log(`📈 Total Revenue Formed: $${totalRevenue.toFixed(2)}`);
    console.log(`📦 Successful Orders Placed: ${totalOrders}`);
    console.log("=========================================");
    console.log("\n📉 Current Inventory Stock Status:");
    
    products.forEach(p => {
      console.log(` - ${p.name}: ${p.stock} units left (Price: $${p.price})`);
    });
    console.log("=========================================");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error reading analytics:", error);
    process.exit(1);
  }
}

checkDashboard();