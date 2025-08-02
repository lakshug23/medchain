import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import { RoleStatus } from '../components/RoleProtection';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { SAMPLE_ACCOUNTS } from '../config/contracts';

const ManufacturerDashboard = () => {
  const { account } = useWallet();
  const { createDrugBatch, userRole, getManufacturerBatches, transferToDistributor } = useContract();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state for creating new batch
  const [newBatch, setNewBatch] = useState({
    drugName: '',
    quantity: '',
    expiryDate: '',
    ipfsHash: ''
  });

  // Transfer modal state
  const [transferModal, setTransferModal] = useState({
    isOpen: false,
    batch: null,
    selectedDistributor: '',
    isTransferring: false
  });

  // QR Code modal state
  const [qrModal, setQrModal] = useState({
    isOpen: false,
    batch: null
  });

  // Available distributors
    const distributors = [
    { address: SAMPLE_ACCOUNTS.distributor.address, name: 'Main Distributor' },
    { address: '0x8ba1f109551bD432803012645Hac136c300cc22d', name: 'Regional Distributor' },
    { address: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec', name: 'Local Distributor' }
  ];

  useEffect(() => {
    console.log('🔍 useEffect triggered - userRole:', userRole, 'account:', account);
    // Load batches regardless of userRole for debugging
    if (account) {
      console.log('✅ Account present, calling loadManufacturerBatches');
      loadManufacturerBatches();
    } else {
      console.log('❌ No account connected');
    }
  }, [account]);

  const loadManufacturerBatches = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading batches for account:', account);
      console.log('🔍 getManufacturerBatches function:', getManufacturerBatches);
      
      const manufacturerBatches = await getManufacturerBatches(account);
      console.log('✅ Batches loaded:', manufacturerBatches);
      setBatches(manufacturerBatches);
    } catch (error) {
      console.error('❌ Error loading manufacturer batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // For MVP, we'll use a mock Merkle root
      const mockMerkleRoot = '0x' + '1'.repeat(64);
      const expiryTimestamp = Math.floor(new Date(newBatch.expiryDate).getTime() / 1000);
      
      await createDrugBatch(
        newBatch.drugName,
        mockMerkleRoot,
        newBatch.ipfsHash || 'QmSampleHash',
        parseInt(newBatch.quantity),
        expiryTimestamp
      );
      
      // Reset form
      setNewBatch({
        drugName: '',
        quantity: '',
        expiryDate: '',
        ipfsHash: ''
      });
      
      // Reload batches
      await loadManufacturerBatches();
      
      alert('Drug batch created successfully!');
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Error creating batch: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Transfer functions
  const openTransferModal = (batch) => {
    setTransferModal({
      isOpen: true,
      batch: batch,
      selectedDistributor: '',
      isTransferring: false
    });
  };

  const closeTransferModal = () => {
    setTransferModal({
      isOpen: false,
      batch: null,
      selectedDistributor: '',
      isTransferring: false
    });
  };

  // QR Modal functions
  const openQRModal = (batch) => {
    setQrModal({
      isOpen: true,
      batch: batch
    });
  };

  const closeQRModal = () => {
    setQrModal({
      isOpen: false,
      batch: null
    });
  };

  const handleTransfer = async () => {
    if (!transferModal.selectedDistributor) {
      alert('Please select a distributor');
      return;
    }

    try {
      setTransferModal(prev => ({ ...prev, isTransferring: true }));
      
      console.log(`🚚 Starting transfer of batch #${transferModal.batch.id} to ${transferModal.selectedDistributor}`);
      
      await transferToDistributor(transferModal.batch.id, transferModal.selectedDistributor);
      
      console.log('✅ Transfer completed successfully!');
      alert(`✅ Batch #${transferModal.batch.id} transferred successfully to distributor!`);
      closeTransferModal();
      
      // Reload batches to show updated status
      setTimeout(() => {
        loadManufacturerBatches();
      }, 2000); // Wait 2 seconds for blockchain confirmation
      
    } catch (error) {
      console.error('❌ Error transferring batch:', error);
      alert(`❌ Error transferring batch: ${error.message}`);
    } finally {
      setTransferModal(prev => ({ ...prev, isTransferring: false }));
    }
  };

  // Temporarily disable userRole check for debugging
  // if (userRole !== 'MANUFACTURER') {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
  //         <p className="text-gray-600">You need manufacturer role to access this dashboard.</p>
  //         <p className="text-sm text-gray-500 mt-2">Current role: {userRole || 'None'}</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🏭 Manufacturer Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Create and manage drug batches
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create New Batch Form */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Drug Batch</h2>
            
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drug Name
                </label>
                <input
                  type="text"
                  value={newBatch.drugName}
                  onChange={(e) => setNewBatch({...newBatch, drugName: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={newBatch.quantity}
                  onChange={(e) => setNewBatch({...newBatch, quantity: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={newBatch.expiryDate}
                  onChange={(e) => setNewBatch({...newBatch, expiryDate: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IPFS Hash (optional)
                </label>
                <input
                  type="text"
                  value={newBatch.ipfsHash}
                  onChange={(e) => setNewBatch({...newBatch, ipfsHash: e.target.value})}
                  className="input-field"
                  placeholder="QmSampleHash..."
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Creating...' : 'Create Batch'}
              </button>
            </form>
          </div>

          {/* Stats and Recent Activity */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{batches.length}</div>
                  <div className="text-sm text-gray-600">Total Batches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {batches.filter(batch => batch.status === 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Available Batches</div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Batches</h3>
              {batches.length > 0 ? (
                <div className="space-y-3">
                  {batches.slice(-3).reverse().map((batch) => (
                    <div key={batch.id} className="border-l-4 border-blue-500 pl-3">
                      <div className="font-medium text-gray-900">{batch.drugName}</div>
                      <div className="text-sm text-gray-600">
                        Batch #{batch.id} • Qty: {batch.quantity} • Status: {getStatusText(batch.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No batches created yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Batches List */}
        <div className="mt-8">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Drug Batches</h2>
              <button
                onClick={loadManufacturerBatches}
                className="btn-secondary"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {loading && batches.length === 0 ? (
              <div className="text-center py-8">
                <div className="spinner mb-4"></div>
                <p className="text-gray-600">Loading batches...</p>
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
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Holder
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
                          {batch.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                            {getStatusText(batch.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.currentHolder.slice(0, 6)}...{batch.currentHolder.slice(-4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => openQRModal(batch)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                            >
                              📱 QR Code
                            </button>
                            {console.log(`🔍 Batch #${batch.id} status:`, batch.status, 'type:', typeof batch.status)}
                            {(batch.status === 0 || batch.status === '0' || Number(batch.status) === 0) && (
                              <button 
                                onClick={() => openTransferModal(batch)}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                              >
                                🚚 Transfer
                              </button>
                            )}
                            {!(batch.status === 0 || batch.status === '0' || Number(batch.status) === 0) && (
                              <span className="text-gray-400 text-xs">
                                Transferred
                              </span>
                            )}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No batches yet</h3>
                <p className="text-gray-600">Create your first drug batch using the form above.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {transferModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Transfer Batch</h3>
            
            {transferModal.batch && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p><strong>Batch #{transferModal.batch.id}</strong></p>
                <p>Drug: {transferModal.batch.drugName}</p>
                <p>Quantity: {transferModal.batch.quantity} units</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Distributor
              </label>
              <select
                value={transferModal.selectedDistributor}
                onChange={(e) => setTransferModal(prev => ({ ...prev, selectedDistributor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a distributor...</option>
                {distributors.map((dist) => (
                  <option key={dist.address} value={dist.address}>
                    {dist.name} ({dist.address.slice(0, 6)}...{dist.address.slice(-4)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeTransferModal}
                disabled={transferModal.isTransferring}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={transferModal.isTransferring || !transferModal.selectedDistributor}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {transferModal.isTransferring ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal.isOpen && qrModal.batch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Drug Tracking QR Code</h3>
              <button
                onClick={closeQRModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p><strong>Batch #{qrModal.batch.id}</strong></p>
              <p>Drug: {qrModal.batch.drugName}</p>
              <p>Quantity: {qrModal.batch.quantity} units</p>
              <p>Manufactured: {new Date(qrModal.batch.timestamp * 1000).toLocaleDateString()}</p>
            </div>

            <QRCodeDisplay
              batchId={qrModal.batch.id}
              drugName={qrModal.batch.drugName}
              manufacturer={qrModal.batch.manufacturer}
              manufactureDateTimestamp={qrModal.batch.timestamp}
              size={300}
            />

            <div className="mt-4 text-center">
              <button
                onClick={closeQRModal}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper functions for status display
  function getStatusColor(status) {
    const statusColors = {
      0: 'bg-blue-100 text-blue-800',    // Manufactured
      1: 'bg-yellow-100 text-yellow-800', // WithDistributor
      2: 'bg-green-100 text-green-800',   // WithHospital
      3: 'bg-purple-100 text-purple-800', // DispensedToPatient
      4: 'bg-red-100 text-red-800'        // Expired
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  function getStatusText(status) {
    const statusText = {
      0: 'Manufactured',
      1: 'With Distributor',
      2: 'With Hospital',
      3: 'Dispensed to Patient',
      4: 'Expired'
    };
    return statusText[status] || 'Unknown';
  }
};

export default ManufacturerDashboard;
