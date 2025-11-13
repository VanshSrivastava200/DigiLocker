const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { isValidAddress } = require('../utils/blockchain');

// @desc    Register/Authenticate user with wallet
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { walletAddress, username, email } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    // Validate wallet address format
    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format. Must be 0x followed by 40 hex characters.'
      });
    }

    // Find or create user
    let user = await User.findByWallet(walletAddress);

    if (user) {
      // Update user info if provided
      if (username) user.username = username;
      if (email) user.email = email;
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        walletAddress,
        username,
        email,
        lastLogin: new Date()
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        did: user.did,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during authentication: ' + error.message
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        did: user.did,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', require('../middleware/auth').protect, async (req, res) => {
  try {
    const { username, email, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        username,
        email,
        profileImage
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        did: user.did,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating profile'
    });
  }
});

module.exports = router;