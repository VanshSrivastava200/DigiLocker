const { v4: uuidv4 } = require('uuid');

const didRegistry = new Map();

exports.generateDID = (identifier) => {
  const did = `did:digilocker:${uuidv4()}`;
  didRegistry.set(did, {
    identifier: identifier.toLowerCase(),
    createdAt: new Date(),
    isActive: true
  });
  didRegistry.set(identifier.toLowerCase(), did);
  console.log(`✅ Generated DID: ${did} for identifier: ${identifier}`);
  return did;
};

exports.verifyDID = (did) => {
  const didRecord = didRegistry.get(did);
  return !!(didRecord && didRecord.isActive);
};

exports.getDIDByWallet = (walletAddress) => {
  return didRegistry.get(walletAddress.toLowerCase());
};

exports.isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};