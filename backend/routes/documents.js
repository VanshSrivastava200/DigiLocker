const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const router = express.Router();
const Document = require('../models/Document');
const pinataService = require('../utils/pinataService');
const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload document
router.post('/upload', protect, upload.single('document'), async (req, res) => {
  try {
    const { documentType, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    if (!documentType) {
      return res.status(400).json({
        success: false,
        error: 'Document type is required'
      });
    }

    console.log(`📤 Uploading document: ${file.originalname}`);

    // Calculate file hash
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Upload to Pinata
    const pinataResult = await pinataService.uploadToIPFS(file.buffer, file.originalname);
    const ipfsURL = pinataService.getGatewayURL(pinataResult.ipfsHash);

    // Save to database
    const document = await Document.create({
      user: req.user.id,
      did: req.user.did,
      documentType,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      description,
      ipfsHash: pinataResult.ipfsHash,
      ipfsURL,
      documentHash: fileHash,
      metadata: {
        uploadedBy: req.user.username,
        uploadMethod: 'web_upload'
      }
    });

    console.log(`✅ Document saved to database: ${document._id}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        documentType: document.documentType,
        fileName: document.fileName,
        fileSize: document.fileSize,
        ipfsHash: document.ipfsHash,
        ipfsURL: document.ipfsURL,
        uploadedAt: document.createdAt,
        isVerified: document.isVerified
      }
    });
  } catch (error) {
    console.error('❌ Document upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Document upload failed: ' + error.message
    });
  }
});

// Get user documents
router.get('/my-documents', protect, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('documentType fileName fileSize fileType ipfsHash ipfsURL isVerified verifiedAt createdAt');

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents'
    });
  }
});

// Get single document
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document'
    });
  }
});

// Delete document
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    });
  }
});

module.exports = router;