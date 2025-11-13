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
    required: true
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

documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ did: 1 });
documentSchema.index({ ipfsHash: 1 });

module.exports = mongoose.model('Document', documentSchema);