import React, { useState, useEffect } from 'react';
import documentService from '../services/documentService';

const DocumentList = ({ user, refresh }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [user, refresh]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await documentService.getMyDocuments();
      if (result.success) {
        setDocuments(result.documents);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const result = await documentService.deleteDocument(documentId);
        if (result.success) {
          setDocuments(documents.filter(doc => doc._id !== documentId));
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to delete document');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No documents found. Upload your first document to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <div key={document._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{document.fileName}</h3>
                  <p className="text-sm text-gray-600 capitalize">{document.documentType}</p>
                  {document.description && (
                    <p className="text-sm text-gray-500 mt-1">{document.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {formatFileSize(document.fileSize)}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      document.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {document.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {new Date(document.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 break-all">
                    IPFS Hash: {document.ipfsHash}
                  </p>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <a
                    href={document.ipfsURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(document._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;