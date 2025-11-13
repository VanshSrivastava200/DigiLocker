import React, { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import DIDGenerator from './components/DIDGenerator';

function App() {
  const [did, setDid] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const handleDIDGenerated = (newDID) => {
    setDid(newDID);
    localStorage.setItem('userDID', newDID);
  };

  const handleUploadSuccess = () => {
    setActiveTab('documents');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Decentralized DigiLocker</h1>
          <p className="text-blue-100 mt-2">Secure document storage on IPFS with Pinata</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!did ? (
          <DIDGenerator onDIDGenerated={handleDIDGenerated} />
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Welcome to Your DigiLocker</h2>
                  <p className="text-gray-600">
                    Your DID: <code className="bg-gray-100 px-2 py-1 rounded">{did}</code>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDid('');
                    localStorage.removeItem('userDID');
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Reset DID
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'upload'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload Document
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'documents'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Documents
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'upload' && (
              <DocumentUpload did={did} onUploadSuccess={handleUploadSuccess} />
            )}
            
            {activeTab === 'documents' && (
              <DocumentList did={did} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;