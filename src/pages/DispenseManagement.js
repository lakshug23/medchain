import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import PatientSelector from '../components/PatientSelector';
import { SAMPLE_ACCOUNTS } from '../config/contracts';

const DispenseManagement = () => {
  const { account } = useWallet();
  const { getHospitalBatches, dispenseToPatient, getAllBatches } = useContract();
  const [hospitalBatches, setHospitalBatches] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [dispenseForm, setDispenseForm] = useState({
    selectedPatient: null,
    quantity: '',
    notes: ''
  });

  useEffect(() => {
    if (account) {
      loadData();
    }
  }, [account]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hospital, all] = await Promise.all([
        getHospitalBatches(account),
        getAllBatches()
      ]);
      setHospitalBatches(hospital);
      setAllBatches(all);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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
      await dispenseToPatient(
        selectedBatch.id,
        dispenseForm.selectedPatient.address,
        parseInt(dispenseForm.quantity)
      );

      alert(`Successfully dispensed ${dispenseForm.quantity} units to ${dispenseForm.selectedPatient.name}!`);
      setShowDispenseModal(false);
      setSelectedBatch(null);
      await loadData();
    } catch (error) {
      console.error('Error dispensing:', error);
      alert(`Failed to dispense: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

  // Get dispensed batches
  const dispensedBatches = allBatches.filter(batch => 
    batch.status === 3 || batch.status === '3' || Number(batch.status) === 3
  );

  const getStatusColor = (status) => {
    const statusColors = {
      0: 'bg-blue-100 text-blue-800',
      1: 'bg-yellow-100 text-yellow-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-purple-100 text-purple-800',
      4: 'bg-red-100 text-red-800'
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
            <h1 className="text-3xl font-bold text-gray-900">💊 Dispense Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage drug dispensing to patients and track dispensed medications
            </p>
            <div className="mt-4">
              <button
                onClick={loadData}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📦</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Available Stock</dt>
                    <dd className="text-lg font-medium text-gray-900">{hospitalBatches.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">👥</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Dispensed Batches</dt>
                    <dd className="text-lg font-medium text-gray-900">{dispensedBatches.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">💉</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Units</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {hospitalBatches.reduce((sum, batch) => sum + parseInt(batch.quantity), 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Stock for Dispensing */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">📦 Available Stock for Dispensing</h2>
            {hospitalBatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drug Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hospitalBatches.map((batch) => (
                      <tr key={batch.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{batch.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.drugName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseInt(batch.quantity).toLocaleString()} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(parseInt(batch.expiryDate) * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDispenseClick(batch)}
                            disabled={parseInt(batch.quantity) === 0}
                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            Dispense
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stock available</h3>
                <p className="text-gray-600">Request stock from distributors to start dispensing.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dispensed Medications History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">📋 Dispensed Medications History</h2>
            {dispensedBatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drug Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Holder</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dispensedBatches.map((batch) => (
                      <tr key={batch.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{batch.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.drugName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                            {getStatusText(batch.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.currentHolder.slice(0, 6)}...{batch.currentHolder.slice(-4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.manufacturer.slice(0, 6)}...{batch.manufacturer.slice(-4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No medications dispensed yet</h3>
                <p className="text-gray-600">Dispensed medications will appear here.</p>
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
                  <h3 className="text-lg font-medium text-gray-900">💊 Dispense to Patient</h3>
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
      </div>
    </div>
  );
};

export default DispenseManagement;
