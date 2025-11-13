const axios = require('axios');
const FormData = require('form-data');

class PinataService {
  constructor() {
    this.apiKey = process.env.PINATA_API_KEY;
    this.secretKey = process.env.PINATA_SECRET_KEY;
    this.jwt = process.env.PINATA_JWT;
    this.baseURL = 'https://api.pinata.cloud';
  }

  async uploadToIPFS(fileBuffer, fileName) {
    try {
      console.log('📤 Uploading to Pinata...');
      
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: 'application/octet-stream'
      });

      const metadata = JSON.stringify({
        name: fileName,
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 0
      });
      formData.append('pinataOptions', options);

      const response = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.jwt}`,
            ...formData.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      console.log('✅ Pinata upload successful:', response.data.IpfsHash);
      return {
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp
      };
    } catch (error) {
      console.error('❌ Pinata upload error:', error.response?.data || error.message);
      throw new Error(`Pinata upload failed: ${error.response?.data?.error || error.message}`);
    }
  }

  getGatewayURL(ipfsHash) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/data/testAuthentication`, {
        headers: {
          'Authorization': `Bearer ${this.jwt}`
        }
      });
      return { authenticated: true, data: response.data };
    } catch (error) {
      return { authenticated: false, error: error.message };
    }
  }
}

module.exports = new PinataService();