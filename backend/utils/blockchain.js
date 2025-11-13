const { v4: uuidv4 } = require('uuid');

// Simple in-memory storage for DIDs
const didRegistry = new Map();

// Generate DID
exports.generateDID = (walletAddress) => {
  // Validate wallet address format
  if (!isValidWalletAddress(walletAddress)) {
    throw new Error('Invalid wallet address format');
  }

  const did = `did:digilocker:${uuidv4()}`;
  
  // Store in memory
  didRegistry.set(did, {
    walletAddress: walletAddress.toLowerCase(),
    createdAt: new Date(),
    isActive: true
  });

  didRegistry.set(walletAddress.toLowerCase(), did);

  console.log(`✅ Generated DID: ${did} for wallet: ${walletAddress}`);
  return did;
};

// Verify DID
exports.verifyDID = (did) => {
  const didRecord = didRegistry.get(did);
  const isValid = !!(didRecord && didRecord.isActive);
  console.log(`🔍 Verified DID: ${did} - ${isValid ? 'VALID' : 'INVALID'}`);
  return isValid;
};

// Get DID by wallet address
exports.getDIDByWallet = (walletAddress) => {
  return didRegistry.get(walletAddress.toLowerCase());
};

// Get wallet address by DID
exports.getWalletByDID = (did) => {
  const record = didRegistry.get(did);
  return record ? record.walletAddress : null;
};

// Revoke DID
exports.revokeDID = (did, walletAddress) => {
  const record = didRegistry.get(did);
  
  if (record && record.walletAddress === walletAddress.toLowerCase()) {
    record.isActive = false;
    didRegistry.set(did, record);
    console.log(`❌ Revoked DID: ${did}`);
    return true;
  }
  
  return false;
};

// Simple wallet address validation
const isValidWalletAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

exports.isValidAddress = isValidWalletAddress;

// Get all DIDs (for admin purposes)
exports.getAllDIDs = () => {
  const dids = [];
  for (const [key, value] of didRegistry) {
    if (key.startsWith('did:')) {
      dids.push({
        did: key,
        walletAddress: value.walletAddress,
        createdAt: value.createdAt,
        isActive: value.isActive
      });
    }
  }
  return dids;
};

// Get DID registry stats
exports.getDIDStats = () => {
  let activeCount = 0;
  let totalCount = 0;

  for (const [key, value] of didRegistry) {
    if (key.startsWith('did:')) {
      totalCount++;
      if (value.isActive) {
        activeCount++;
      }
    }
  }

  return {
    totalDIDs: totalCount,
    activeDIDs: activeCount,
    registrySize: didRegistry.size
  };
};

// Mock blockchain functions (for future use)
exports.getWeb3Instance = () => {
  console.log('⚠️  Blockchain not configured - using mock mode');
  return null;
};

exports.createWallet = () => {
  throw new Error('Blockchain not configured. Please set BLOCKCHAIN_RPC in environment variables.');
};

exports.getBalance = async (address) => {
  throw new Error('Blockchain not configured. Please set BLOCKCHAIN_RPC in environment variables.');
};