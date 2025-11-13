import React, { useState } from 'react';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshDocuments, setRefreshDocuments] = useState(0);

  const handleUploadSuccess = () => {
    setActiveTab('documents');
    setRefreshDocuments(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome to DigiLocker, {user.username}!</h1>
                <p className="text-gray-600 mt-2">
                  Your DID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{user.did}</code>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Account Type: {user.authMethod}</p>
                {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
                {user.walletAddress && (
                  <p className="text-sm text-gray-500">Wallet: {user.walletAddress.substring(0, 10)}...</p>
                )}
              </div>
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
              📤 Upload Document
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'documents'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📂 My Documents
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'upload' && (
            <DocumentUpload user={user} onUploadSuccess={handleUploadSuccess} />
          )}
          
          {activeTab === 'documents' && (
            <DocumentList user={user} refresh={refreshDocuments} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;