import React, { useState } from 'react';
import pinataService from '../services/pinataService';

const DocumentUpload = ({ did, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file');
      return;
    }

    if (!documentType) {
      alert('Please select document type');
      return;
    }

    if (!did) {
      alert('Please generate a DID first');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      // Create metadata
      const metadata = {
        did: did,
        documentType: documentType,
        description: description,
        uploadedFrom: 'digilocker-frontend'
      };

      // Upload to Pinata
      const result = await pinataService.uploadFile(file, file.name, metadata);

      if (result.success) {
        setUploadResult(result);
        
        // Store document info in localStorage (temporary solution)
        const documentInfo = {
          id: Date.now(),
          did: did,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          documentType: documentType,
          description: description,
          ipfsHash: result.ipfsHash,
          gatewayURL: result.gatewayURL,
          uploadedAt: new Date().toISOString(),
          verified: false
        };

        // Save to localStorage
        const existingDocuments = JSON.parse(localStorage.getItem('userDocuments') || '[]');
        existingDocuments.push(documentInfo);
        localStorage.setItem('userDocuments', JSON.stringify(existingDocuments));

        // Call success callback
        if (onUploadSuccess) {
          onUploadSuccess(documentInfo);
        }

        alert('Document uploaded successfully to IPFS!');
        
        // Reset form
        setFile(null);
        setDocumentType('');
        setDescription('');
        e.target.reset();
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Upload Document to IPFS</h2>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Document Type</option>
            <option value="aadhar">Aadhar Card</option>
            <option value="pan">PAN Card</option>
            <option value="license">Driving License</option>
            <option value="passport">Passport</option>
            <option value="degree">Degree Certificate</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the document"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File (Max 10MB)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            required
          />
          {file && (
            <p className="mt-1 text-sm text-gray-500">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading || !did}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading to IPFS...' : 'Upload Document'}
        </button>
      </form>

      {uploadResult && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-green-800 font-semibold">Upload Successful!</h3>
          <p className="text-green-700 text-sm mt-1">
            IPFS Hash: <code className="bg-green-100 px-1 rounded">{uploadResult.ipfsHash}</code>
          </p>
          <p className="text-green-700 text-sm">
            File Size: {(uploadResult.pinSize / 1024).toFixed(2)} KB
          </p>
          <a
            href={uploadResult.gatewayURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm underline mt-2 inline-block"
          >
            View on IPFS Gateway
          </a>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;