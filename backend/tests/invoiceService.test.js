const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { generateOrderInvoice } = require('../utils/invoiceService');

test('generateOrderInvoice creates a PDF file and returns its path', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'invoice-test-'));
  const order = {
    _id: '64f9f3d8e2f3c6b2a9e12345',
    userId: '64f9f3d8e2f3c6b2a9e12345',
    products: [
      { productId: { name: 'Wireless Mouse' }, quantity: 2, price: 24.99 },
      { productId: { name: 'USB-C Cable' }, quantity: 1, price: 12.5 }
    ],
    totalAmount: 62.48,
    deliveryAddress: { street: '123 Market St', city: 'Austin', state: 'TX', zipCode: '78701' },
    paymentStatus: 'success',
    orderStatus: 'shipped',
    createdAt: new Date('2026-07-22T10:00:00.000Z')
  };

  const customer = { name: 'Sample Customer', email: 'customer@example.com' };

  const filePath = await generateOrderInvoice(order, customer, tempDir);

  assert.ok(filePath);
  assert.match(filePath, /\.pdf$/i);
  assert.ok(fs.existsSync(filePath));
  assert.ok(fs.statSync(filePath).size > 0);
});
