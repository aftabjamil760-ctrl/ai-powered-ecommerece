const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  context: {
    type: Object,
    default: {}
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceType: String
  },
  summary: {
    type: String,
    default: ''
  },
  keyTopics: [String],
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  messageCount: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update timestamps
chatSessionSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);