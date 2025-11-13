import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const documentService = {
  // Upload document to backend (which then uploads to Pinata)
  async uploadDocument(formData) {
    try {
      console.log('📤 Uploading document...');
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for large files
      });
      
      console.log('✅ Document upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Document upload error:', error);
      throw new Error(error.response?.data?.error || 'Document upload failed');
    }
  },

  // Get all documents for the current user
  async getMyDocuments() {
    try {
      console.log('📋 Fetching user documents...');
      const response = await api.get('/documents/my-documents');
      return response.data;
    } catch (error) {
      console.error('❌ Get documents error:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch documents');
    }
  },

  // Get a specific document by ID
  async getDocument(id) {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch document');
    }
  },

  // Delete a document
  async deleteDocument(id) {
    try {
      console.log('🗑️ Deleting document:', id);
      const response = await api.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Delete document error:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete document');
    }
  },

  // Download document from IPFS
  async downloadDocument(ipfsURL, fileName) {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = ipfsURL;
      link.target = '_blank';
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (error) {
      throw new Error('Download failed: ' + error.message);
    }
  },

  // Get document info from IPFS
  async getDocumentInfo(ipfsHash) {
    try {
      const ipfsURL = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      const response = await fetch(ipfsURL, { method: 'HEAD' });
      
      return {
        exists: response.ok,
        url: ipfsURL,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      };
    } catch (error) {
      throw new Error('Failed to get document info: ' + error.message);
    }
  }
};

export default documentService;