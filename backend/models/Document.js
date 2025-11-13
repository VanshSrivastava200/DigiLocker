const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  did: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: [true, 'Document type is required'],
    enum: ['aadhar', 'pan', 'license', 'passport', 'degree', 'other']
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  ipfsHash: {
    type: String,
    required: true,
    unique: true
  },
  ipfsURL: {
    type: String,
    required: true
  },
  documentHash: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: String
  },
  verifiedAt: {
    type: Date
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ did: 1 });
documentSchema.index({ ipfsHash: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ isVerified: 1 });

// Static method to find documents by DID
documentSchema.statics.findByDID = function(did) {
  return this.find({ did }).populate('user', 'walletAddress username').sort({ createdAt: -1 });
};

// Static method to find documents by user
documentSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Instance method to verify document
documentSchema.methods.verify = function(verifiedBy) {
  this.isVerified = true;
  this.verifiedBy = verifiedBy;
  this.verifiedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Document', documentSchema);