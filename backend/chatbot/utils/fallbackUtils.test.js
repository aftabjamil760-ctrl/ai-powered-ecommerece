const test = require('node:test');
const assert = require('node:assert/strict');
const { createLocalEmbedding, createFallbackResponse } = require('./fallbackUtils');

test('createLocalEmbedding returns a fixed-size vector', () => {
  const embedding = createLocalEmbedding('wireless headphones');
  assert.equal(embedding.length, 384);
  assert.ok(embedding.every((value) => typeof value === 'number'));
});

test('createFallbackResponse returns a helpful answer for product queries', () => {
  const response = createFallbackResponse('find wireless headphones', []);
  assert.match(response.toLowerCase(), /wireless headphones/i);
  assert.match(response.toLowerCase(), /currently unable/i);
});
