const fs = require('node:fs');
const path = require('node:path');
const PDFDocument = require('pdfkit');

const ensureInvoiceDir = (outputDir) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
};

exports.generateOrderInvoice = async (order, customer, outputDir = path.join(__dirname, '..', 'uploads', 'invoices')) => {
  ensureInvoiceDir(outputDir);

  const invoicePath = path.resolve(outputDir, `${order._id}.pdf`);
  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(invoicePath);

  return new Promise((resolve, reject) => {
    doc.on('error', reject);
    stream.on('error', reject);
    stream.on('finish', () => resolve(invoicePath));

    doc.pipe(stream);
    doc.fontSize(24).text('E-Commerce Store', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Invoice #: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`);
    doc.text(`Customer: ${customer?.name || 'Customer'}`);
    doc.text(`Email: ${customer?.email || ''}`);
    doc.moveDown();

    doc.text('Items');
    doc.moveDown(0.2);
    order.products?.forEach((item) => {
      const name = item.productId?.name || item.productId || 'Product';
      const lineTotal = (item.price ?? 0) * (item.quantity ?? 0);
      doc.text(`${name} x${item.quantity ?? 0} — $${lineTotal.toFixed(2)}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Amount: $${Number(order.totalAmount || 0).toFixed(2)}`);
    doc.moveDown();
    doc.fontSize(10).text(`Payment Status: ${order.paymentStatus || 'pending'}`);
    doc.text(`Order Status: ${order.orderStatus || 'processing'}`);

    if (order.deliveryAddress) {
      doc.moveDown();
      doc.text('Delivery Address');
      doc.text(`${order.deliveryAddress.street || ''}`);
      doc.text(`${order.deliveryAddress.city || ''}, ${order.deliveryAddress.state || ''} ${order.deliveryAddress.zipCode || ''}`);
    }

    doc.end();
  });
};
