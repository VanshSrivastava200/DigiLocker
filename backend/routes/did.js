const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateDID, verifyDID, getDIDByWallet, revokeDID } = require('../utils/blockchain');
const { protect } = require('../middleware/auth');

// @desc    Generate DID for user
// @route   POST /api/did/generate
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    console.log('🆔 Generating DID for user:', req.user.id);
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.did) {
      return res.status(400).json({
        success: false,
        error: 'User already has a DID'
      });
    }

    // Generate DID
    const did = generateDID(user.walletAddress);
    console.log('✅ Generated DID:', did);

    // Update user with DID
    user.did = did;
    await user.save();
    console.log('💾 Saved DID to database for user:', user._id);

    res.status(201).json({
      success: true,
      did,
      message: 'DID generated successfully'
    });
  } catch (error) {
    console.error('❌ DID generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate DID: ' + error.message
    });
  }
});

// Other routes remain the same...
module.exports = router;