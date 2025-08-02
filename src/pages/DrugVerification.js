import React, { useState } from 'react';
import { useContract } from '../contexts/ContractContext';
import QRScanner from '../components/QRScanner';

const DrugVerification = () => {
  const { contract, verifyDrug, verifyAndLog, getDrugBatch } = useContract();
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [drugNameInput, setDrugNameInput] = useState('');
  const [error, setError] = useState('');
  
  // Merkle proof verification state
  const [merkleVerificationMode, setMerkleVerificationMode] = useState(false);
  const [drugData, setDrugData] = useState('');
  const [merkleProof, setMerkleProof] = useState('');
  const [merkleResult, setMerkleResult] = useState(null);

  const verifyDrugBatch = async (batchId, drugName = '') => {
    if (!contract) {
      setError('Contract not connected');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get batch information from contract
      const batch = await contract.batches(batchId);
      
      if (batch.manufacturer === '0x0000000000000000000000000000000000000000') {
        setError('Batch not found in blockchain');
        setLoading(false);
        return;
      }

      // Get transfer history
      const transferFilter = contract.filters.DrugTransferred(batchId);
      const transferEvents = await contract.queryFilter(transferFilter);

      // Get dispensing history
      const dispenseFilter = contract.filters.DrugDispensed(batchId);
      const dispenseEvents = await contract.queryFilter(dispenseFilter);

      // Build comprehensive tracking history
      const trackingHistory = [];

      // Add manufacture event
      trackingHistory.push({
        action: 'Manufactured',
        timestamp: batch.timestamp.toNumber(),
        actor: batch.manufacturer,
        location: 'Manufacturing Facility',
        details: `Batch created with ${batch.quantity} units`,
        blockNumber: 'Genesis'
      });

      // Add transfer events
      transferEvents.forEach(event => {
        trackingHistory.push({
          action: 'Transferred',
          timestamp: event.args.timestamp.toNumber(),
          actor: event.args.to,
          from: event.args.from,
          location: getLocationFromAddress(event.args.to),
          details: `Transferred from ${getLocationFromAddress(event.args.from)} to ${getLocationFromAddress(event.args.to)}`,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      });

      // Add dispensing events
      dispenseEvents.forEach(event => {
        trackingHistory.push({
          action: 'Dispensed',
          timestamp: event.args.timestamp.toNumber(),
          actor: event.args.hospital,
          patient: event.args.patient,
          location: 'Hospital/Pharmacy',
          details: `Dispensed ${event.args.quantity} units to patient`,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      });

      // Sort by timestamp
      trackingHistory.sort((a, b) => a.timestamp - b.timestamp);

      const result = {
        isValid: true,
        batch: {
          id: batchId,
          drugName: batch.drugName,
          manufacturer: batch.manufacturer,
          manufactureDate: new Date(batch.timestamp.toNumber() * 1000),
          quantity: batch.quantity.toNumber(),
          currentQuantity: batch.currentQuantity.toNumber(),
          status: batch.currentQuantity.toNumber() > 0 ? 'Active' : 'Fully Dispensed'
        },
        trackingHistory,
        verificationDate: new Date(),
        totalTransfers: transferEvents.length,
        totalDispensed: batch.quantity.toNumber() - batch.currentQuantity.toNumber()
      };

      // Validate drug name if provided
      if (drugName && batch.drugName.toLowerCase() !== drugName.toLowerCase()) {
        result.isValid = false;
        result.error = 'Drug name mismatch';
      }

      setVerificationResult(result);
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify drug. Please check the batch ID.');
    } finally {
      setLoading(false);
    }
  };

  const getLocationFromAddress = (address) => {
    // This would typically map addresses to known locations
    // For demo purposes, we'll use a simple mapping
    const locationMap = {
      // Add known addresses here
    };
    
    return locationMap[address] || `Address: ${address.slice(0, 8)}...`;
  };

  const handleQRScan = (qrData) => {
    verifyDrugBatch(qrData.batchId, qrData.drugName);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setError('Please enter a batch ID');
      return;
    }
    verifyDrugBatch(searchInput.trim(), drugNameInput.trim());
  };

  const handleQRError = (errorMessage) => {
    setError(errorMessage);
  };

  // Merkle proof verification
  const handleMerkleVerification = async () => {
    if (!searchInput || !drugData || !merkleProof) {
      setError('Please fill in all fields for Merkle verification');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Parse the drug data to create leaf hash
      const drugObject = JSON.parse(drugData);
      const keccak256 = require('keccak256');
      const drugHash = keccak256(JSON.stringify(drugObject));
      
      // Parse the Merkle proof
      const proofArray = JSON.parse(merkleProof);
      
      // Verify the drug using smart contract
      const isValid = await verifyDrug(parseInt(searchInput), drugHash, proofArray);
      
      setMerkleResult({
        isValid,
        drugHash: drugHash.toString('hex'),
        timestamp: new Date().toISOString(),
        batchId: searchInput
      });

      // Also log the verification on-chain
      await verifyAndLog(parseInt(searchInput), drugHash, proofArray);

    } catch (error) {
      console.error('Merkle verification error:', error);
      setMerkleResult({
        isValid: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        batchId: searchInput
      });
    } finally {
      setLoading(false);
    }
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setMerkleResult(null);
    setError('');
    setSearchInput('');
    setDrugNameInput('');
    setDrugData('');
    setMerkleProof('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Drug Verification System</h1>
          <p className="text-gray-600 mb-4">Verify the authenticity and track the history of pharmaceutical products</p>
          
          {/* Verification Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setMerkleVerificationMode(false)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  !merkleVerificationMode 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Standard Verification
              </button>
              <button
                onClick={() => setMerkleVerificationMode(true)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  merkleVerificationMode 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> Merkle Proof Verification
              </button>
            </div>
          </div>
        </div>

        {!verificationResult && !merkleResult && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* QR Scanner */}
            {!merkleVerificationMode && (
              <div>
                <QRScanner 
                  onScan={handleQRScan}
                  onError={handleQRError}
                  showDetailedResults={true}
                />
              </div>
            )}

            {/* Manual Search */}
            <div className={`p-6 border rounded-lg bg-white ${merkleVerificationMode ? 'md:col-span-2' : ''}`}>
              <h3 className="text-lg font-semibold mb-4">
                {merkleVerificationMode ? 'Merkle Proof Verification' : 'Manual Verification'}
              </h3>
              
              <form onSubmit={merkleVerificationMode ? (e) => { e.preventDefault(); handleMerkleVerification(); } : handleManualSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch ID *
                  </label>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Enter batch ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {!merkleVerificationMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drug Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={drugNameInput}
                      onChange={(e) => setDrugNameInput(e.target.value)}
                      placeholder="Enter drug name for cross-verification"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {merkleVerificationMode && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Drug Data (JSON) *
                      </label>
                      <textarea
                        value={drugData}
                        onChange={(e) => setDrugData(e.target.value)}
                        placeholder='{"name": "Paracetamol", "dosage": "500mg", "manufacturer": "PharmaCorp"}'
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Merkle Proof (JSON Array) *
                      </label>
                      <textarea
                        value={merkleProof}
                        onChange={(e) => setMerkleProof(e.target.value)}
                        placeholder='["0x123...", "0x456...", "0x789..."]'
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        required
                      />
                    </div>
                  </>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : (merkleVerificationMode ? 'Verify with Merkle Proof' : 'Verify Drug')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 border border-red-300 rounded-lg bg-red-50">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Verifying drug authenticity...</span>
            </div>
          </div>
        )}

        {/* Merkle Verification Results */}
        {merkleResult && (
          <div className="mt-8 space-y-6">
            {/* Verification Status */}
            <div className={`p-6 rounded-lg border-2 ${
              merkleResult.isValid 
                ? 'border-green-300 bg-green-50' 
                : 'border-red-300 bg-red-50'
            }`}>
              <div className="flex items-center mb-4">
                <span className={`text-3xl mr-3 ${
                  merkleResult.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {merkleResult.isValid ? <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </span>
                <div>
                  <h2 className={`text-xl font-bold ${
                    merkleResult.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {merkleResult.isValid ? 'MERKLE PROOF VERIFIED' : 'MERKLE VERIFICATION FAILED'}
                  </h2>
                  <p className={`text-sm ${
                    merkleResult.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {merkleResult.isValid 
                      ? 'Drug data has been cryptographically verified using Merkle proof' 
                      : merkleResult.error || 'Merkle proof verification failed'
                    }
                  </p>
                </div>
              </div>

              {merkleResult.isValid && (
                <div className="bg-white p-4 rounded border text-sm">
                  <div><strong>Batch ID:</strong> {merkleResult.batchId}</div>
                  <div><strong>Drug Hash:</strong> 0x{merkleResult.drugHash}</div>
                  <div><strong>Verified At:</strong> {new Date(merkleResult.timestamp).toLocaleString()}</div>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setMerkleResult(null);
                  setSearchInput('');
                  setDrugData('');
                  setMerkleProof('');
                  setError('');
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Verify Another Drug
              </button>
            </div>
          </div>
        )}

        {/* Standard Verification Results */}
        {verificationResult && (
          <div className="mt-8 space-y-6">
            {/* Verification Status */}
            <div className={`p-6 rounded-lg border-2 ${
              verificationResult.isValid 
                ? 'border-green-300 bg-green-50' 
                : 'border-red-300 bg-red-50'
            }`}>
              <div className="flex items-center mb-4">
                <span className={`text-3xl mr-3 ${
                  verificationResult.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {verificationResult.isValid ? <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </span>
                <div>
                  <h2 className={`text-xl font-bold ${
                    verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {verificationResult.isValid ? 'VERIFIED AUTHENTIC' : 'VERIFICATION FAILED'}
                  </h2>
                  <p className={`text-sm ${
                    verificationResult.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {verificationResult.isValid 
                      ? 'This drug has been verified on the blockchain' 
                      : verificationResult.error || 'Drug could not be verified'
                    }
                  </p>
                </div>
              </div>
            </div>

            {verificationResult.isValid && (
              <>
                {/* Batch Information */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Batch Information</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Batch ID:</strong> {verificationResult.batch.id}</div>
                    <div><strong>Drug Name:</strong> {verificationResult.batch.drugName}</div>
                    <div><strong>Manufacturer:</strong> {verificationResult.batch.manufacturer}</div>
                    <div><strong>Manufacture Date:</strong> {verificationResult.batch.manufactureDate.toLocaleDateString()}</div>
                    <div><strong>Original Quantity:</strong> {verificationResult.batch.quantity} units</div>
                    <div><strong>Current Quantity:</strong> {verificationResult.batch.currentQuantity} units</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        verificationResult.batch.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {verificationResult.batch.status}
                      </span>
                    </div>
                    <div><strong>Total Dispensed:</strong> {verificationResult.totalDispensed} units</div>
                  </div>
                </div>

                {/* Tracking History */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Supply Chain History</h3>
                  <div className="space-y-4">
                    {verificationResult.trackingHistory.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 border-l-4 border-blue-200 bg-blue-50">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-blue-800">{event.action}</span>
                            <span className="text-gray-500 text-sm">
                              {new Date(event.timestamp * 1000).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{event.details}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            {event.location} • Block: {event.blockNumber}
                            {event.transactionHash && (
                              <span> • Tx: {event.transactionHash.slice(0, 10)}...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Summary */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Verification Summary</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="font-bold text-blue-800">{verificationResult.trackingHistory.length}</div>
                      <div className="text-blue-600">Total Events</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="font-bold text-green-800">{verificationResult.totalTransfers}</div>
                      <div className="text-green-600">Transfers</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="font-bold text-purple-800">{verificationResult.totalDispensed}</div>
                      <div className="text-purple-600">Units Dispensed</div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Verified on: {verificationResult.verificationDate.toLocaleString()}
                  </div>
                </div>
              </>
            )}

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={resetVerification}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Verify Another Drug
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrugVerification;
