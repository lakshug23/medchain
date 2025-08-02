import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import { SAMPLE_ACCOUNTS } from '../config/contracts';
import PatientSelector from '../components/PatientSelector';
import { RoleStatus } from '../components/RoleProtection';
import QRScanner from '../components/QRScanner';
import QRCodeDisplay from '../components/QRCodeDisplay';

const HospitalDashboard = () => {
  const { account } = useWallet();
  const { getHospitalBatches, getTransferHistory, userRole, dispenseToPatient } = useContract();
  const [batches, setBatches] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [dispenseForm, setDispenseForm] = useState({
    selectedPatient: null,
    quantity: '',
    notes: ''
  });

  // QR scanning state
  const [qrScanModal, setQrScanModal] = useState({
    isOpen: false,
    isScanning: false
  });

  // QR display modal state
  const [qrDisplayModal, setQrDisplayModal] = useState({
    isOpen: false,
    batch: null
  });

  // Scan log state
  const [scanLogs, setScanLogs] = useState([]);

  useEffect(() => {
    console.log('🔍 Hospital useEffect triggered - userRole:', userRole, 'account:', account);
    if (account) {
      console.log('✅ Account present, calling loadHospitalBatches');
      loadHospitalBatches();
      loadTransferHistory();
    } else {
      console.log('❌ No account connected');
    }
  }, [account]);

  const loadHospitalBatches = async () => {
    if (!account) return;

    try {
      setLoading(true);
      console.log('🔍 Starting to load hospital batches...');
      const hospitalBatches = await getHospitalBatches(account);
      console.log('✅ Hospital batches loaded:', hospitalBatches);
      setBatches(hospitalBatches);
    } catch (error) {
      console.error('❌ Error loading hospital batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransferHistory = async () => {
    if (!account) return;

    try {
      console.log('🔍 Loading transfer history...');
      const history = await getTransferHistory(account);
      console.log('✅ Transfer history loaded:', history);
      setTransferHistory(history);
    } catch (error) {
      console.error('❌ Error loading transfer history:', error);
    }
  };

  const handleDispenseClick = (batch) => {
    setSelectedBatch(batch);
    setDispenseForm({
      selectedPatient: null,
      quantity: '',
      notes: ''
    });
    setShowDispenseModal(true);
  };

  const handlePatientSelect = (patient) => {
    setDispenseForm(prev => ({
      ...prev,
      selectedPatient: patient
    }));
  };

  const handleManualPatientInput = (address) => {
    setDispenseForm(prev => ({
      ...prev,
      selectedPatient: { address, name: 'Manual Entry' }
    }));
  };

  const handleDispenseSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBatch || !dispenseForm.selectedPatient || !dispenseForm.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseInt(dispenseForm.quantity) > parseInt(selectedBatch.quantity)) {
      alert('Quantity exceeds available stock');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Dispensing to patient...', {
        batchId: selectedBatch.id,
        patient: dispenseForm.selectedPatient.address,
        quantity: dispenseForm.quantity
      });

      await dispenseToPatient(
        selectedBatch.id,
        dispenseForm.selectedPatient.address,
        parseInt(dispenseForm.quantity)
      );

      console.log('✅ Successfully dispensed to patient');
      alert(`Successfully dispensed ${dispenseForm.quantity} units to patient!`);
      
      // Reset form and close modal
      setShowDispenseModal(false);
      setSelectedBatch(null);
      setDispenseForm({
        selectedPatient: null,
        quantity: '',
        patientName: '',
        notes: ''
      });

      // Reload data
      await loadHospitalBatches();
      
    } catch (error) {
      console.error('❌ Error dispensing to patient:', error);
      alert(`Failed to dispense: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // QR Scanning functions
  const openQRScanModal = () => {
    setQrScanModal({
      isOpen: true,
      isScanning: false
    });
  };

  const closeQRScanModal = () => {
    setQrScanModal({
      isOpen: false,
      isScanning: false
    });
  };

  const handleQRScan = (qrData) => {
    // Log the scan
    const scanLog = {
      id: Date.now(),
      timestamp: new Date(),
      batchId: qrData.batchId,
      drugName: qrData.drugName,
      manufacturer: qrData.manufacturer,
      scannedAt: 'Hospital',
      scannedBy: account
    };
    
    setScanLogs(prev => [scanLog, ...prev]);
    
    // Show success message
    alert(`✅ QR Code scanned successfully!\nBatch ID: ${qrData.batchId}\nDrug: ${qrData.drugName}`);
    closeQRScanModal();
  };

  const handleQRScanError = (error) => {
    alert(`❌ QR Scan Error: ${error}`);
  };

  // QR Display functions
  const openQRDisplayModal = (batch) => {
    setQrDisplayModal({
      isOpen: true,
      batch: batch
    });
  };

  const closeQRDisplayModal = () => {
    setQrDisplayModal({
      isOpen: false,
      batch: null
    });
  };

  // Calculate statistics
  const totalBatches = batches.length;
  const totalUnits = batches.reduce((sum, batch) => sum + parseInt(batch.quantity), 0);

  // Helper functions for status display
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🏥 Hospital Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage and track drug batches received from distributors
                </p>
                {account && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Connected as: {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    <RoleStatus />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📦</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Batches
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {totalBatches}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">💊</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Units
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {totalUnits.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🏥</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Status
                    </dt>
                    <dd className="text-lg font-medium text-green-600">
                      Active
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📋</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total History
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {transferHistory.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Scanning and Tracking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* QR Scanning */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📱 QR Code Scanning</h3>
              <p className="text-sm text-gray-600 mb-4">
                Scan QR codes to verify and log drug batches before dispensing
              </p>
              <button
                onClick={openQRScanModal}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 font-medium"
              >
                Start QR Scanner
              </button>
            </div>
          </div>

          {/* Recent Scan Logs */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Recent Scans</h3>
              {scanLogs.length > 0 ? (
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {scanLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="border-l-4 border-green-500 pl-3 py-2">
                      <div className="text-sm font-medium text-gray-900">
                        Batch #{log.batchId} - {log.drugName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.timestamp.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No scans recorded yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Current Inventory */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Current Inventory</h2>
              <div className="flex space-x-3">
                <a
                  href="/dispense"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  💊 Dispense Management
                </a>
                <button
                  onClick={loadHospitalBatches}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading inventory...</p>
              </div>
            ) : batches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Drug Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manufacturer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batches.map((batch) => (
                      <tr key={batch.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{batch.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.drugName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseInt(batch.quantity).toLocaleString()} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.manufacturer.slice(0, 6)}...{batch.manufacturer.slice(-4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                            {getStatusText(batch.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(parseInt(batch.expiryDate) * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => openQRDisplayModal(batch)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                            >
                              📱 QR Code
                            </button>
                            <button 
                              onClick={() => handleDispenseClick(batch)}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                              disabled={parseInt(batch.quantity) === 0}
                            >
                              💊 Dispense
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No batches in inventory</h3>
                <p className="text-gray-600">
                  Batches transferred from distributors will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Transfer History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">📋 Transfer History</h2>
            
            {transferHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Drug Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Holder
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transferHistory.map((batch) => (
                      <tr key={batch.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{batch.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.drugName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                            {getStatusText(batch.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.currentHolder.slice(0, 6)}...{batch.currentHolder.slice(-4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transfer history yet</h3>
                <p className="text-gray-600">
                  Transfer history will appear here as you receive batches.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dispense Modal */}
        {showDispenseModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    💊 Dispense to Patient
                  </h3>
                  <button
                    onClick={() => setShowDispenseModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {selectedBatch && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-gray-900">Batch #{selectedBatch.id}</h4>
                    <p className="text-sm text-gray-600">Drug: {selectedBatch.drugName}</p>
                    <p className="text-sm text-gray-600">Available: {parseInt(selectedBatch.quantity).toLocaleString()} units</p>
                  </div>
                )}

                <form onSubmit={handleDispenseSubmit} className="space-y-4">
                  <PatientSelector
                    selectedPatient={dispenseForm.selectedPatient}
                    onPatientSelect={handlePatientSelect}
                    onManualInput={handleManualPatientInput}
                  />

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity to Dispense *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={selectedBatch ? selectedBatch.quantity : ''}
                      value={dispenseForm.quantity}
                      onChange={(e) => setDispenseForm(prev => ({
                        ...prev,
                        quantity: e.target.value
                      }))}
                      placeholder="Number of units"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical Notes (Optional)
                    </label>
                    <textarea
                      value={dispenseForm.notes}
                      onChange={(e) => setDispenseForm(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                      placeholder="Prescription details, dosage instructions, etc."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowDispenseModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !dispenseForm.selectedPatient || !dispenseForm.quantity}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Dispensing...' : 'Dispense to Patient'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner Modal */}
        {qrScanModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Scan Drug QR Code</h3>
                <button
                  onClick={closeQRScanModal}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <QRScanner 
                onScan={handleQRScan}
                onError={handleQRScanError}
              />
            </div>
          </div>
        )}

        {/* QR Display Modal */}
        {qrDisplayModal.isOpen && qrDisplayModal.batch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Drug Tracking QR Code</h3>
                <button
                  onClick={closeQRDisplayModal}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p><strong>Batch #{qrDisplayModal.batch.id}</strong></p>
                <p>Drug: {qrDisplayModal.batch.drugName}</p>
                <p>Quantity: {qrDisplayModal.batch.quantity} units</p>
                <p>Status: {getStatusText(qrDisplayModal.batch.status)}</p>
              </div>

              <QRCodeDisplay
                batchId={qrDisplayModal.batch.id}
                drugName={qrDisplayModal.batch.drugName}
                manufacturer={qrDisplayModal.batch.manufacturer}
                manufactureDateTimestamp={qrDisplayModal.batch.timestamp}
                size={300}
              />

              <div className="mt-4 text-center">
                <button
                  onClick={closeQRDisplayModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
