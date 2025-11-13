import axios from 'axios';

class PinataService {
  constructor() {
    // Pinata API credentials (in production, these should be in environment variables)
    this.apiKey = import.meta.env.VITE_PINATA_API_KEY || 'your-pinata-api-key';
    this.secretKey = import.meta.env.VITE_PINATA_SECRET_KEY || 'your-pinata-secret-key';
    this.jwt = import.meta.env.VITE_PINATA_JWT || 'your-pinata-jwt';
    
    this.baseURL = 'https://api.pinata.cloud';
    
    // Create axios instance for Pinata
    this.pinataAPI = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.jwt}`,
        // Alternative: Use API key/secret
        // 'pinata_api_key': this.apiKey,
        // 'pinata_secret_api_key': this.secretKey
      }
    });
  }

  // Test Pinata connection
  async testConnection() {
    try {
      const response = await this.pinataAPI.get('/data/testAuthentication');
      return {
        success: true,
        data: response.data,
        message: 'Successfully connected to Pinata'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Upload file to IPFS
  async uploadFile(file, fileName, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add pinata metadata
      const pinataMetadata = JSON.stringify({
        name: fileName || file.name,
        keyvalues: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
          originalName: file.name
        }
      });
      formData.append('pinataMetadata', pinataMetadata);

      // Add pinata options
      const pinataOptions = JSON.stringify({
        cidVersion: 0,
        wrapWithDirectory: false
      });
      formData.append('pinataOptions', pinataOptions);

      const response = await this.pinataAPI.post('/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        gatewayURL: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
      };
    } catch (error) {
      console.error('Pinata upload error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Upload JSON data to IPFS
  async uploadJSON(data, name) {
    try {
      const pinataContent = data;
      const pinataMetadata = JSON.stringify({
        name: name || `json-data-${Date.now()}`
      });

      const response = await this.pinataAPI.post('/pinning/pinJSONToIPFS', {
        pinataContent,
        pinataMetadata
      });

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        gatewayURL: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get list of pinned files
  async getPinnedFiles(filters = {}) {
    try {
      const response = await this.pinataAPI.get('/data/pinList', {
        params: filters
      });
      return {
        success: true,
        files: response.data.rows,
        count: response.data.count
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get file from IPFS gateway
  getFileURL(ipfsHash) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  }

  // Alternative public gateway
  getPublicFileURL(ipfsHash) {
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  }

  // Download file
  async downloadFile(ipfsHash, fileName) {
    try {
      const url = this.getFileURL(ipfsHash);
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || `document-${ipfsHash}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create and export singleton instance
const pinataService = new PinataService();
export default pinataService;