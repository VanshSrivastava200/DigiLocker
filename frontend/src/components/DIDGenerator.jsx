import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DIDGenerator = ({ onDIDGenerated }) => {
  const [generating, setGenerating] = useState(false);

  const generateDID = async () => {
    setGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const did = `did:digilocker:${uuidv4()}`;
      onDIDGenerated(did);
      setGenerating(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Get Started with DigiLocker</h2>
      
      <p className="text-gray-600 mb-6">
        Generate your Decentralized Identifier (DID) to start storing documents securely on IPFS.
        Your DID is your unique digital identity in the system.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
        <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Generate your unique DID</li>
          <li>• Upload documents to IPFS via Pinata</li>
          <li>• Documents are stored decentralized and secure</li>
          <li>• Access your documents anytime from any device</li>
        </ul>
      </div>

      <button
        onClick={generateDID}
        disabled={generating}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {generating ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating DID...
          </div>
        ) : (
          'Generate My DID'
        )}
      </button>
    </div>
  );
};

export default DIDGenerator;