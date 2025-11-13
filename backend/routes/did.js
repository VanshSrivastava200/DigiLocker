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
    const user = await User.findById(req.user.id);

    if (user.did) {
      return res.status(400).json({
        success: false,
        error: 'User already has a DID'
      });
    }

    // Generate DID
    const did = generateDID(user.walletAddress);

    // Update user with DID
    user.did = did;
    await user.save();

    res.status(201).json({
      success: true,
      did,
      message: 'DID generated successfully'
    });
  } catch (error) {
    console.error('DID generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate DID: ' + error.message
    });
  }
});

// @desc    Verify DID
// @route   GET /api/did/verify/:did
// @access  Public
router.get('/verify/:did', async (req, res) => {
  try {
    const { did } = req.params;

    if (!did) {
      return res.status(400).json({
        success: false,
        error: 'DID is required'
      });
    }

    const isValid = verifyDID(did);
    let user = null;

    if (isValid) {
      // Find user associated with this DID
      user = await User.findOne({ did });
    }

    res.json({
      success: true,
      verified: isValid,
      did,
      user: user ? {
        walletAddress: user.walletAddress,
        username: user.username
      } : null
    });
  } catch (error) {
    console.error('DID verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during DID verification'
    });
  }
});

// @desc    Get user's DID
// @route   GET /api/did/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.did) {
      return res.status(404).json({
        success: false,
        error: 'DID not found for user'
      });
    }

    res.json({
      success: true,
      did: user.did,
      walletAddress: user.walletAddress
    });
  } catch (error) {
    console.error('Get DID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching DID'
    });
  }
});

// @desc    Get DID by wallet address
// @route   GET /api/did/wallet/:walletAddress
// @access  Public
router.get('/wallet/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    const did = getDIDByWallet(walletAddress);
    const user = await User.findByWallet(walletAddress);

    if (!did) {
      return res.status(404).json({
        success: false,
        error: 'DID not found for this wallet address'
      });
    }

    res.json({
      success: true,
      did,
      walletAddress,
      user: user ? {
        username: user.username,
        hasProfile: true
      } : {
        hasProfile: false
      }
    });
  } catch (error) {
    console.error('Get DID by wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching DID by wallet'
    });
  }
});

// @desc    Revoke DID
// @route   POST /api/did/revoke
// @access  Private
router.post('/revoke', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.did) {
      return res.status(400).json({
        success: false,
        error: 'User does not have a DID to revoke'
      });
    }

    const success = revokeDID(user.did, user.walletAddress);

    if (success) {
      // Remove DID from user record
      user.did = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'DID revoked successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to revoke DID'
      });
    }
  } catch (error) {
    console.error('DID revocation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during DID revocation'
    });
  }
});

module.exports = router;