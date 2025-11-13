const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Document = require('../models/Document');
const { protect } = require('../middleware/auth');

// @desc    Get user documents
// @route   GET /api/users/documents
// @access  Private
router.get('/documents', protect, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: documents.length,
      documents: documents.map(doc => ({
        id: doc._id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        description: doc.description,
        ipfsHash: doc.ipfsHash,
        ipfsURL: doc.ipfsURL,
        isVerified: doc.isVerified,
        verifiedBy: doc.verifiedBy,
        verifiedAt: doc.verifiedAt,
        uploadedAt: doc.createdAt,
        metadata: doc.metadata
      }))
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching documents'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const documentCount = await Document.countDocuments({ user: req.user.id });
    const verifiedCount = await Document.countDocuments({ 
      user: req.user.id, 
      isVerified: true 
    });
    
    const recentDocuments = await Document.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fileName documentType createdAt isVerified');

    res.json({
      success: true,
      stats: {
        totalDocuments: documentCount,
        verifiedDocuments: verifiedCount,
        verificationRate: documentCount > 0 ? (verifiedCount / documentCount * 100).toFixed(1) : 0
      },
      recentDocuments: recentDocuments.map(doc => ({
        fileName: doc.fileName,
        documentType: doc.documentType,
        createdAt: doc.createdAt,
        isVerified: doc.isVerified
      }))
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user stats'
    });
  }
});

module.exports = router;