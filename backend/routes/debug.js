const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Debug route to test database operations
// @route   POST /api/debug/test-user
// @access  Public
router.post('/test-user', async (req, res) => {
  try {
    console.log('🧪 Starting debug test...');
    
    // Test 1: Check database connection
    const dbState = mongoose.connection.readyState;
    console.log('📊 Database state:', dbState, '(0=disconnected, 1=connected, 2=connecting, 3=disconnecting)');
    
    // Test 2: Create a test user
    const testWallet = '0xDEBUG123456789012345678901234567890123456';
    console.log('👤 Creating test user with wallet:', testWallet);
    
    const testUser = new User({
      walletAddress: testWallet,
      username: 'debug_user',
      email: 'debug@test.com'
    });
    
    console.log('💾 Attempting to save user...');
    const savedUser = await testUser.save();
    console.log('✅ User saved successfully:', savedUser._id);
    
    // Test 3: Verify user exists in database
    const foundUser = await User.findById(savedUser._id);
    console.log('🔍 User found in database:', foundUser ? 'Yes' : 'No');
    
    // Test 4: Count all users
    const userCount = await User.countDocuments();
    console.log('📈 Total users in database:', userCount);
    
    res.json({
      success: true,
      message: 'Debug test completed',
      data: {
        databaseState: dbState,
        userCreated: !!savedUser,
        userId: savedUser._id,
        userFound: !!foundUser,
        totalUsers: userCount
      }
    });
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Debug test failed: ' + error.message,
      stack: error.stack
    });
  }
});

// @desc    Get all users (for debugging)
// @route   GET /api/debug/users
// @access  Public
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('walletAddress did username createdAt').lean();
    
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;