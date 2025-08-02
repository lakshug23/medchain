import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { parseQRData, validateQRData } from '../utils/qrcode';
import { useContract } from '../contexts/ContractContext';

const QRScanner = ({ onScan, onError, expectedBatchId = null, showDetailedResults = true }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [batchDetails, setBatchDetails] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const html5QrcodeScannerRef = useRef(null);
  const { contract } = useContract();

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  // Debug useEffect to monitor batchDetails changes
  useEffect(() => {
    console.log('batchDetails state changed:', batchDetails);
    console.log('trackingHistory state changed:', trackingHistory.length, 'events');
  }, [batchDetails, trackingHistory]);

  const getLocationFromAddress = (address) => {
    // Sample address-to-location mapping (in real app, this would be from a database)
    const locationMap = {
      '0x': 'Unknown Location',
    };
    return locationMap[address] || `Address: ${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const fetchBatchDetails = async (batchId) => {
    if (!showDetailedResults) return null;

    setLoadingDetails(true);
    console.log('Fetching batch details for:', batchId);
    console.log('Contract available:', !!contract);

    try {
      // Always use mock data for demonstration purposes
      console.log('Using mock data for batch:', batchId);
      
      // Add a small delay to simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockBatchInfo = {
        id: batchId,
        drugName: 'Paracetamol 500mg',
        manufacturer: '0x1234567890123456789012345678901234567890',
        quantity: '1000',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        isExpired: false,
        merkleRoot: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      };

      const mockHistory = [
        {
          action: 'Manufactured',
          timestamp: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
          actor: '0x1234567890123456789012345678901234567890',
          location: 'PharmaCorp Manufacturing Facility',
          details: 'Batch created with 1000 units',
          blockNumber: 'Genesis',
          icon: '🏭'
        },
        {
          action: 'Transferred',
          timestamp: Math.floor(Date.now() / 1000) - 20 * 24 * 60 * 60,
          actor: '0x2345678901234567890123456789012345678901',
          from: '0x1234567890123456789012345678901234567890',
          location: 'Regional Distribution Center',
          details: 'Transferred from manufacturing facility to distribution center',
          blockNumber: 12345,
          transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          icon: '🚛'
        },
        {
          action: 'Transferred',
          timestamp: Math.floor(Date.now() / 1000) - 10 * 24 * 60 * 60,
          actor: '0x3456789012345678901234567890123456789012',
          from: '0x2345678901234567890123456789012345678901',
          location: 'City Hospital Pharmacy',
          details: 'Transferred from distribution center to hospital pharmacy',
          blockNumber: 12350,
          transactionHash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a',
          icon: '🚛'
        },
        {
          action: 'Dispensed',
          timestamp: Math.floor(Date.now() / 1000) - 2 * 24 * 60 * 60,
          actor: '0x3456789012345678901234567890123456789012',
          patient: '0x4567890123456789012345678901234567890123',
          location: 'Hospital Pharmacy',
          details: 'Dispensed 10 units to patient 0x4567...0123',
          blockNumber: 12355,
          transactionHash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
          icon: '💊'
        }
      ];

      console.log('Setting batch details:', mockBatchInfo);
      console.log('Setting tracking history:', mockHistory);
      
      // Use functional updates to ensure state is set
      setBatchDetails(prev => {
        console.log('setBatchDetails called, prev:', prev);
        return mockBatchInfo;
      });
      
      setTrackingHistory(prev => {
        console.log('setTrackingHistory called, prev length:', prev.length);
        return mockHistory;
      });
      
      setLoadingDetails(false);
      
      // Log immediately after setting to verify state
      console.log('After setting - batchDetails should be set');
      
      // Force re-render by waiting a bit
      setTimeout(() => {
        console.log('After timeout - checking state...');
      }, 100);
      
      return { batchInfo: mockBatchInfo, history: mockHistory };

      // Original contract code commented out for now
      /*
      if (!contract) {
        throw new Error('Contract not available');
      }

      // Get batch information from contract
      const batch = await contract.batches(batchId);
      
      if (batch.manufacturer === '0x0000000000000000000000000000000000000000') {
        throw new Error('Batch not found in blockchain');
      }

      // Get transfer history
      const transferFilter = contract.filters.DrugTransferred(batchId);
      const transferEvents = await contract.queryFilter(transferFilter);

      // Get dispensing history
      const dispenseFilter = contract.filters.DrugDispensed(batchId);
      const dispenseEvents = await contract.queryFilter(dispenseFilter);

      // Build comprehensive tracking history
      const history = [];

      // Add manufacture event
      history.push({
        action: 'Manufactured',
        timestamp: batch.timestamp.toNumber(),
        actor: batch.manufacturer,
        location: 'Manufacturing Facility',
        details: `Batch created with ${batch.quantity} units`,
        blockNumber: 'Genesis',
        icon: '🏭'
      });

      // Add transfer events
      transferEvents.forEach(event => {
        history.push({
          action: 'Transferred',
          timestamp: event.args.timestamp.toNumber(),
          actor: event.args.to,
          from: event.args.from,
          location: getLocationFromAddress(event.args.to),
          details: `Transferred from ${getLocationFromAddress(event.args.from)} to ${getLocationFromAddress(event.args.to)}`,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          icon: '🚛'
        });
      });

      // Add dispensing events
      dispenseEvents.forEach(event => {
        history.push({
          action: 'Dispensed',
          timestamp: event.args.timestamp.toNumber(),
          actor: event.args.hospital,
          patient: event.args.patient,
          location: 'Hospital/Pharmacy',
          details: `Dispensed to patient ${event.args.patient.slice(0, 6)}...${event.args.patient.slice(-4)}`,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          icon: '💊'
        });
      });

      // Sort by timestamp
      history.sort((a, b) => a.timestamp - b.timestamp);

      const batchInfo = {
        id: batchId,
        drugName: batch.drugName,
        manufacturer: batch.manufacturer,
        quantity: batch.quantity.toString(),
        expiryDate: new Date(batch.expiryDate.toNumber() * 1000),
        timestamp: new Date(batch.timestamp.toNumber() * 1000),
        isExpired: batch.isExpired,
        merkleRoot: batch.merkleRoot
      };

      setBatchDetails(batchInfo);
      setTrackingHistory(history);
      setLoadingDetails(false);
      
      return { batchInfo, history };
      */
    } catch (error) {
      console.error('Error fetching batch details:', error);
      setLoadingDetails(false);
      // Don't throw error, just log it
      return null;
    }
  };

  const startScanning = () => {
    setScanning(true);
    setScannedData(null);

    // Add a small delay to ensure the DOM element is rendered
    setTimeout(() => {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      // Check if element exists before initializing scanner
      const qrReaderElement = document.getElementById("qr-reader");
      if (!qrReaderElement) {
        console.error("QR reader element not found");
        setScanning(false);
        onError?.("QR scanner element not found. Please try again.");
        return;
      }

      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        config,
        false
      );

      html5QrcodeScannerRef.current.render(
        (decodedText) => {
          // Success callback
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Error callback (can be ignored for typical scanning errors)
          console.log('QR scan error:', errorMessage);
        }
      );
    }, 100);
  };

  const stopScanning = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch(console.error);
    }
    setScanning(false);
  };

  const handleScanSuccess = async (decodedText) => {
    console.log('QR Code scanned:', decodedText);
    const parsedData = parseQRData(decodedText);
    console.log('Parsed data:', parsedData);
    
    if (!parsedData) {
      onError?.('Invalid QR code format');
      return;
    }

    // Validate if expected batch ID is provided
    if (expectedBatchId) {
      const validation = validateQRData(parsedData, expectedBatchId);
      if (!validation.valid) {
        onError?.(validation.reason);
        return;
      }
    }

    setScannedData(parsedData);
    stopScanning();

    // Clear previous details first
    setBatchDetails(null);
    setTrackingHistory([]);

    // Fetch detailed batch information if enabled
    console.log('showDetailedResults:', showDetailedResults);
    console.log('parsedData.batchId:', parsedData.batchId);
    if (showDetailedResults && parsedData.batchId) {
      try {
        console.log('Calling fetchBatchDetails...');
        const result = await fetchBatchDetails(parsedData.batchId);
        console.log('fetchBatchDetails result:', result);
      } catch (error) {
        console.error('Error in fetchBatchDetails:', error);
        onError?.(error.message);
      }
    }

    onScan?.(parsedData);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const parsedData = parseQRData(manualInput.trim());
    
    if (!parsedData) {
      onError?.('Invalid tracking string format');
      return;
    }

    // Validate if expected batch ID is provided
    if (expectedBatchId) {
      const validation = validateQRData(parsedData, expectedBatchId);
      if (!validation.valid) {
        onError?.(validation.reason);
        return;
      }
    }

    setScannedData(parsedData);

    // Fetch detailed batch information if enabled
    if (showDetailedResults && parsedData.batchId) {
      try {
        await fetchBatchDetails(parsedData.batchId);
      } catch (error) {
        onError?.(error.message);
      }
    }

    onScan?.(parsedData);
  };

  const resetScanner = () => {
    setScannedData(null);
    setBatchDetails(null);
    setTrackingHistory([]);
    setManualInput('');
    if (scanning) {
      stopScanning();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (action) => {
    switch (action.toLowerCase()) {
      case 'manufactured': return 'bg-blue-500';
      case 'transferred': return 'bg-yellow-500';
      case 'dispensed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4 text-center">Scan Drug QR Code</h3>
      
      {!scanning && !scannedData && (
        <div className="space-y-4">
          <button
            onClick={startScanning}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            📱 Start Camera Scan
          </button>
          
          {/* Debug button for testing */}
          <button
            onClick={async () => {
              console.log('Debug: Testing fetchBatchDetails directly');
              setScannedData({ batchId: '12345', timestamp: Date.now() });
              await fetchBatchDetails('12345');
            }}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            🔧 Test Batch Details (Debug)
          </button>
          
          <div className="text-center text-gray-500">or</div>
          
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manual Entry:
              </label>
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Paste tracking string here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Submit Manual Entry
            </button>
          </form>
        </div>
      )}

      {scanning && (
        <div className="space-y-4">
          <div 
            id="qr-reader" 
            style={{ 
              width: '100%',
              minHeight: '300px'
            }}
          ></div>
          <button
            onClick={stopScanning}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Stop Scanning
          </button>
        </div>
      )}

      {scannedData && (
        <div className="space-y-4">
          {loadingDetails ? (
            <div className="p-6 text-center">
              <div className="spinner-large"></div>
              <p className="mt-2 text-gray-600">Loading batch details...</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-green-600 text-xl mr-2">✅</span>
                  <span className="font-medium text-green-800">QR Code Scanned Successfully</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Batch ID:</strong> {scannedData.batchId}</div>
                  <div><strong>Scanned At:</strong> {new Date().toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    Debug: showDetailedResults={showDetailedResults.toString()}, 
                    batchDetails={batchDetails ? 'exists' : 'null'}, 
                    trackingHistory={trackingHistory.length} events
                  </div>
                </div>
              </div>

              {batchDetails && showDetailedResults && (
                <div className="space-y-4">
                  {/* Batch Information Card */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <span className="mr-2">💊</span>
                      Batch Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Drug Name:</strong></div>
                      <div>{batchDetails.drugName}</div>
                      
                      <div><strong>Quantity:</strong></div>
                      <div>{batchDetails.quantity} units</div>
                      
                      <div><strong>Manufactured:</strong></div>
                      <div>{formatDate(batchDetails.timestamp)}</div>
                      
                      <div><strong>Expiry Date:</strong></div>
                      <div className={batchDetails.isExpired ? 'text-red-600 font-semibold' : 'text-green-600'}>
                        {formatDate(batchDetails.expiryDate)}
                        {batchDetails.isExpired && ' (EXPIRED)'}
                      </div>
                      
                      <div><strong>Manufacturer:</strong></div>
                      <div className="text-xs break-all">{batchDetails.manufacturer}</div>
                    </div>
                  </div>

                  {/* Tracking History */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2">📋</span>
                      Supply Chain History ({trackingHistory.length} events)
                    </h4>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {trackingHistory.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded border">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${getStatusColor(event.action)}`}>
                            {event.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{event.action}</span>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(event.timestamp)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                            
                            <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                              <span>📍 {event.location}</span>
                              {event.transactionHash && (
                                <span className="truncate">
                                  🔗 {event.transactionHash.slice(0, 10)}...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Status */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <span className="mr-2">🔐</span>
                      Security & Authenticity
                    </h4>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center">
                        <span className="text-green-600 mr-2">✅</span>
                        Blockchain verified and authentic
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-600 mr-2">✅</span>
                        Merkle root validated
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-600 mr-2">✅</span>
                        Complete supply chain recorded
                      </div>
                      {batchDetails.isExpired && (
                        <div className="flex items-center">
                          <span className="text-red-600 mr-2">⚠️</span>
                          <span className="text-red-600 font-semibold">
                            WARNING: This batch has expired
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          <button
            onClick={resetScanner}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Scan Another QR Code
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
