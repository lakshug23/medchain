import React, { useState } from 'react';
import { useContract } from '../contexts/ContractContext';

const DrugVerifier = () => {
  const { verifyDrug, verifyAndLog, getDrugBatch } = useContract();
  const [batchId, setBatchId] = useState('');
  const [drugData, setDrugData] = useState('');
  const [merkleProof, setMerkleProof] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchInfo, setBatchInfo] = useState(null);

  const handleVerification = async () => {
    if (!batchId || !drugData || !merkleProof) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Parse the drug data to create leaf hash
      const drugObject = JSON.parse(drugData);
      const keccak256 = require('keccak256');
      const drugHash = keccak256(JSON.stringify(drugObject));
      
      // Parse the Merkle proof
      const proofArray = JSON.parse(merkleProof);
      
      // Verify the drug
      const isValid = await verifyDrug(parseInt(batchId), drugHash, proofArray);
      
      setVerificationResult({
        isValid,
        drugHash: drugHash.toString('hex'),
        timestamp: new Date().toISOString()
      });

      // Also log the verification on-chain
      await verifyAndLog(parseInt(batchId), drugHash, proofArray);

    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        isValid: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBatchInfo = async () => {
    if (!batchId) return;

    try {
      setLoading(true);
      const batch = await getDrugBatch(parseInt(batchId));
      setBatchInfo(batch);
    } catch (error) {
      console.error('Error loading batch:', error);
      setBatchInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      0: 'bg-blue-100 text-blue-800',    // Manufactured
      1: 'bg-yellow-100 text-yellow-800', // WithDistributor
      2: 'bg-green-100 text-green-800',   // WithHospital
      3: 'bg-purple-100 text-purple-800', // DispensedToPatient
      4: 'bg-red-100 text-red-800'        // Expired
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const statusText = {
      0: 'Manufactured',
      1: 'With Distributor',
      2: 'With Hospital',
      3: 'Dispensed to Patient',
      4: 'Expired'
    };
    return statusText[status] || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔍 Drug Verification System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Verify the authenticity of pharmaceutical products using blockchain technology 
            and cryptographic proofs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verification Form */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Verify Drug Authenticity
            </h2>

            <div className="space-y-6">
              {/* Batch ID Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch ID
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    placeholder="Enter batch ID (e.g., 1)"
                    className="input-field flex-1"
                  />
                  <button
                    onClick={loadBatchInfo}
                    disabled={!batchId || loading}
                    className="btn-secondary px-4"
                  >
                    Load Info
                  </button>
                </div>
              </div>

              {/* Drug Data Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drug Data (JSON)
                </label>
                <textarea
                  value={drugData}
                  onChange={(e) => setDrugData(e.target.value)}
                  placeholder={`{
  "name": "Paracetamol",
  "batchNumber": "PAR-001",
  "manufacturer": "PharmaCorp",
  "serialNumber": "SN123456"
}`}
                  rows={6}
                  className="input-field font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the drug metadata in JSON format exactly as it was recorded
                </p>
              </div>

              {/* Merkle Proof Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merkle Proof (JSON Array)
                </label>
                <textarea
                  value={merkleProof}
                  onChange={(e) => setMerkleProof(e.target.value)}
                  placeholder={`[
  "0x1234...",
  "0x5678...",
  "0x9abc..."
]`}
                  rows={4}
                  className="input-field font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the Merkle proof array obtained from the manufacturer
                </p>
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerification}
                disabled={loading || !batchId || !drugData || !merkleProof}
                className="btn-primary w-full py-3 text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Verifying...
                  </span>
                ) : (
                  '🔍 Verify Drug Authenticity'
                )}
              </button>
            </div>
          </div>

          {/* Results and Batch Info */}
          <div className="space-y-6">
            {/* Batch Information */}
            {batchInfo && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📦 Batch Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Drug Name:</span>
                    <span className="font-medium">{batchInfo.drugName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Batch ID:</span>
                    <span className="font-medium">{batchInfo.batchId.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Manufacturer:</span>
                    <span className="font-mono text-sm">{batchInfo.manufacturer.slice(0, 10)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{batchInfo.quantity.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batchInfo.status)}`}>
                      {getStatusText(batchInfo.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Holder:</span>
                    <span className="font-mono text-sm">{batchInfo.currentHolder.slice(0, 10)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span className="font-medium">
                      {new Date(Number(batchInfo.expiryDate) * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Result */}
            {verificationResult && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📋 Verification Result
                </h3>
                
                <div className={`p-4 rounded-lg mb-4 ${
                  verificationResult.isValid 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    <div className={`text-2xl mr-3 ${
                      verificationResult.isValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {verificationResult.isValid ? '✅' : '❌'}
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold ${
                        verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {verificationResult.isValid ? 'Drug Verified' : 'Verification Failed'}
                      </h4>
                      <p className={`text-sm ${
                        verificationResult.isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {verificationResult.isValid 
                          ? 'This drug is authentic and part of the verified batch'
                          : 'This drug could not be verified or may be counterfeit'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Drug Hash:</span>
                    <span className="font-mono text-xs">{verificationResult.drugHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verification Time:</span>
                    <span className="font-medium">
                      {new Date(verificationResult.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {verificationResult.error && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Error:</span>
                      <span className="text-red-600 text-xs">{verificationResult.error}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* How it Works */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🔧 How Verification Works
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-blue-600 font-bold mr-2">1.</span>
                  <span>Each drug batch has a unique Merkle tree stored on blockchain</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 font-bold mr-2">2.</span>
                  <span>Individual drugs are leaves in the Merkle tree</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 font-bold mr-2">3.</span>
                  <span>Merkle proof mathematically proves a drug belongs to the batch</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 font-bold mr-2">4.</span>
                  <span>Verification is instant and cryptographically secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Data Section */}
        <div className="mt-12 card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📝 Sample Verification Data
          </h3>
          <p className="text-gray-600 mb-4">
            Use this sample data to test the verification system (works with batch ID 1 if deployed):
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sample Drug Data:</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "name": "Paracetamol",
  "batchNumber": "PAR-001",
  "manufacturer": "PharmaCorp Ltd",
  "manufactureDate": "2024-01-15T10:00:00Z",
  "expiryDate": "2025-01-15T10:00:00Z",
  "serialNumber": "SN1234567890",
  "additionalData": "{\\"dosage\\":\\"500mg\\",\\"form\\":\\"tablet\\"}"
}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sample Merkle Proof:</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`[
  "0xa1b2c3d4e5f6...",
  "0x1234567890ab...",
  "0xfedcba098765..."
]`}
              </pre>
              <p className="text-xs text-gray-500 mt-2">
                Note: Actual proofs are generated by the manufacturer's system
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugVerifier;
