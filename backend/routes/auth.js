const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { generateDID, isValidAddress } = require('../utils/blockchain');

// Register with email/password
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and username are required'
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    const did = generateDID(email);
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      username,
      fullName,
      did,
      authMethod: 'email',
      lastLogin: new Date()
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      message: 'Registration successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        did: user.did,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed: ' + error.message
    });
  }
});

// Login with email/password
router.post('/email-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const user = await User.findByEmail(email);
    if (!user || user.authMethod !== 'email') {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        did: user.did,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message
    });
  }
});

// Wallet login
router.post('/wallet-login', async (req, res) => {
  try {
    const { walletAddress, username } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    let user = await User.findByWallet(walletAddress);

    if (user) {
      user.lastLogin = new Date();
      await user.save();
    } else {
      const did = generateDID(walletAddress);
      user = await User.create({
        walletAddress: walletAddress.toLowerCase(),
        username: username || `user_${walletAddress.slice(2, 10)}`,
        did,
        authMethod: 'wallet',
        lastLogin: new Date()
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      message: 'Wallet login successful',
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        did: user.did,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Wallet login failed: ' + error.message
    });
  }
});

// Get user profile
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        did: user.did,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
});

module.exports = router;