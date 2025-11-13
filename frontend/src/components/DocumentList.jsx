import React, { useState, useEffect } from 'react';
import pinataService from '../services/pinataService';

const DocumentList = ({ did }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [did]);

  const loadDocuments = () => {
    try {
      const storedDocuments = JSON.parse(localStorage.getItem('userDocuments') || '[]');
      const userDocuments = did 
        ? storedDocuments.filter(doc => doc.did === did)
        : storedDocuments;
      setDocuments(userDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      const result = await pinataService.downloadFile(document.ipfsHash, document.fileName);
      if (!result.success) {
        alert('Download failed: ' + result.error);
      }
    } catch (error) {
      alert('Download failed. Please try again.');
    }
  };

  const handleDelete = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      setDocuments(updatedDocuments);
      localStorage.setItem('userDocuments', JSON.stringify(updatedDocuments));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
      
      {documents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No documents found. Upload your first document to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{document.fileName}</h3>
                  <p className="text-sm text-gray-600 capitalize">{document.documentType}</p>
                  {document.description && (
                    <p className="text-sm text-gray-500 mt-1">{document.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {document.verified ? 'Verified' : 'Unverified'}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {new Date(document.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 break-all">
                    IPFS Hash: {document.ipfsHash}
                  </p>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleDownload(document)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(document.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <a
                  href={document.gatewayURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  View on IPFS
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(document.ipfsHash)}
                  className="text-gray-600 hover:text-gray-800 text-sm underline"
                >
                  Copy IPFS Hash
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;