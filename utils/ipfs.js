const axios = require('axios');
const FormData = require('form-data');

/**
 * IPFS Integration utilities for MedChain
 * Supports both web3.storage and Pinata
 */

class IPFSManager {
  constructor(config = {}) {
    this.web3StorageToken = config.web3StorageToken || process.env.WEB3_STORAGE_TOKEN;
    this.pinataApiKey = config.pinataApiKey || process.env.PINATA_API_KEY;
    this.pinataSecretKey = config.pinataSecretKey || process.env.PINATA_SECRET_KEY;
    this.preferredService = config.preferredService || 'pinata'; // 'pinata' or 'web3storage'
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(data, filename = 'data.json') {
    try {
      if (this.preferredService === 'pinata' && this.pinataApiKey) {
        return await this.uploadToPinata(data, filename);
      } else if (this.preferredService === 'web3storage' && this.web3StorageToken) {
        return await this.uploadToWeb3Storage(data, filename);
      } else {
        throw new Error('No IPFS service configured');
      }
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload to Pinata
   */
  async uploadToPinata(data, filename) {
    const formData = new FormData();
    const jsonString = JSON.stringify(data, null, 2);
    
    formData.append('file', Buffer.from(jsonString), {
      filename: filename,
      contentType: 'application/json'
    });

    const metadata = JSON.stringify({
      name: filename,
      keyvalues: {
        timestamp: new Date().toISOString(),
        type: 'medchain-data'
      }
    });
    formData.append('pinataMetadata', metadata);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey
        }
      }
    );

    return {
      hash: response.data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      service: 'pinata'
    };
  }

  /**
   * Upload to Web3.Storage
   */
  async uploadToWeb3Storage(data, filename) {
    const { Web3Storage, File } = require('web3.storage');
    
    const client = new Web3Storage({ token: this.web3StorageToken });
    const jsonString = JSON.stringify(data, null, 2);
    
    const file = new File([jsonString], filename, {
      type: 'application/json'
    });

    const cid = await client.put([file]);

    return {
      hash: cid,
      url: `https://${cid}.ipfs.w3s.link/${filename}`,
      service: 'web3storage'
    };
  }

  /**
   * Retrieve data from IPFS
   */
  async retrieveJSON(hash, service = this.preferredService) {
    try {
      let url;
      
      if (service === 'pinata') {
        url = `https://gateway.pinata.cloud/ipfs/${hash}`;
      } else if (service === 'web3storage') {
        url = `https://${hash}.ipfs.w3s.link/data.json`;
      } else {
        // Try public gateway
        url = `https://ipfs.io/ipfs/${hash}`;
      }

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('IPFS retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Pin existing hash (Pinata only)
   */
  async pinByHash(hash, name) {
    if (!this.pinataApiKey) {
      throw new Error('Pinata API key not configured');
    }

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinByHash',
      {
        hashToPin: hash,
        pinataMetadata: {
          name: name,
          keyvalues: {
            timestamp: new Date().toISOString(),
            type: 'medchain-data'
          }
        }
      },
      {
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey
        }
      }
    );

    return response.data;
  }

  /**
   * List pinned files (Pinata only)
   */
  async listPinnedFiles() {
    if (!this.pinataApiKey) {
      throw new Error('Pinata API key not configured');
    }

    const response = await axios.get(
      'https://api.pinata.cloud/data/pinList',
      {
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey
        }
      }
    );

    return response.data;
  }
}

/**
 * Utility functions for specific MedChain use cases
 */

/**
 * Upload drug batch data to IPFS
 */
async function uploadDrugBatch(drugs, batchMetadata = {}) {
  const ipfs = new IPFSManager();
  
  const batchData = {
    metadata: {
      batchId: batchMetadata.batchId || Date.now(),
      timestamp: new Date().toISOString(),
      manufacturer: batchMetadata.manufacturer || 'Unknown',
      totalDrugs: drugs.length,
      ...batchMetadata
    },
    drugs: drugs
  };

  const result = await ipfs.uploadJSON(batchData, `drug-batch-${batchData.metadata.batchId}.json`);
  console.log('Drug batch uploaded to IPFS:', result.hash);
  return result;
}

/**
 * Upload health record to IPFS
 */
async function uploadHealthRecord(patientAddress, healthData) {
  const ipfs = new IPFSManager();
  
  const recordData = {
    patientAddress: patientAddress,
    timestamp: new Date().toISOString(),
    healthData: healthData,
    version: '1.0'
  };

  const result = await ipfs.uploadJSON(recordData, `health-record-${patientAddress}.json`);
  console.log('Health record uploaded to IPFS:', result.hash);
  return result;
}

/**
 * Upload expired drug report to IPFS
 */
async function uploadExpiredReport(reportData) {
  const ipfs = new IPFSManager();
  
  const report = {
    reportId: reportData.reportId || Date.now(),
    timestamp: new Date().toISOString(),
    reporter: reportData.reporter,
    batchId: reportData.batchId,
    evidence: reportData.evidence,
    reason: reportData.reason || 'Drug expired',
    photos: reportData.photos || [],
    additionalNotes: reportData.additionalNotes || ''
  };

  const result = await ipfs.uploadJSON(report, `expired-report-${report.reportId}.json`);
  console.log('Expired drug report uploaded to IPFS:', result.hash);
  return result;
}

/**
 * Upload WHO approved drug list to IPFS
 */
async function uploadWHODrugList(drugList) {
  const ipfs = new IPFSManager();
  
  const whoData = {
    timestamp: new Date().toISOString(),
    version: '2024.1',
    approvedDrugs: drugList,
    totalCount: drugList.length
  };

  const result = await ipfs.uploadJSON(whoData, 'who-approved-drugs.json');
  console.log('WHO drug list uploaded to IPFS:', result.hash);
  return result;
}

module.exports = {
  IPFSManager,
  uploadDrugBatch,
  uploadHealthRecord,
  uploadExpiredReport,
  uploadWHODrugList
};

// Example usage for testing
if (require.main === module) {
  console.log("=== MedChain IPFS Utility Demo ===\n");
  
  // Note: This requires actual API keys to work
  const sampleDrugBatch = [
    {
      name: "Paracetamol",
      batchNumber: "PAR-001",
      manufacturer: "PharmaCorp",
      serialNumber: "SN123456"
    }
  ];

  // Simulate upload (requires API keys)
  console.log("Sample drug batch for upload:", sampleDrugBatch);
  console.log("To upload, configure IPFS API keys in .env file");
}
