import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import { SAMPLE_ACCOUNTS } from '../config/contracts';

const DispenseTestPage = () => {
  const { account } = useWallet();
  const { 
    getAllBatches, 
    getHospitalBatches, 
    dispenseToPatient,
    transferToHospital,
    getDistributorBatches
  } = useContract();

  const [allBatches, setAllBatches] = useState([]);
  const [hospitalBatches, setHospitalBatches] = useState([]);
  const [distributorBatches, setDistributorBatches] = useState([]);
  const [dispensedBatches, setDispensedBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const hospitalAccount = SAMPLE_ACCOUNTS.hospital.address;
  const distributorAccount = SAMPLE_ACCOUNTS.distributor.address;

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [all, hospital, distributor] = await Promise.all([
        getAllBatches(),
        getHospitalBatches(hospitalAccount),
        getDistributorBatches(distributorAccount)
      ]);

      setAllBatches(all);
      setHospitalBatches(hospital);
      setDistributorBatches(distributor);

      // Filter dispensed batches
      const dispensed = all.filter(batch => 
        batch.status === 3 || batch.status === '3' || Number(batch.status) === 3
      );
      setDispensedBatches(dispensed);

      console.log('✅ Complete data loaded:', {
        total: all.length,
        hospital: hospital.length,
        distributor: distributor.length,
        dispensed: dispensed.length
      });
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testTransferToHospital = async () => {
    if (distributorBatches.length === 0) {
      alert('No batches available at distributor');
      return;
    }

    const firstBatch = distributorBatches[0];
    try {
      setLoading(true);
      console.log('🔄 Transferring batch to hospital:', firstBatch.id);
      await transferToHospital(firstBatch.id, hospitalAccount);
      alert(`Successfully transferred batch #${firstBatch.id} to hospital!`);
      await loadAllData();
    } catch (error) {
      console.error('❌ Transfer failed:', error);
      alert(`Transfer failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDispenseToPatient = async () => {
    if (hospitalBatches.length === 0) {
      alert('No batches available at hospital for dispensing');
      return;
    }

    const firstBatch = hospitalBatches[0];
    const firstPatient = SAMPLE_ACCOUNTS.patients[0];
    const quantity = Math.min(5, parseInt(firstBatch.quantity)); // Dispense 5 units or available quantity

    try {
      setLoading(true);
      console.log('🔄 Dispensing to patient:', {
        batchId: firstBatch.id,
        patient: firstPatient.address,
        quantity
      });

      await dispenseToPatient(firstBatch.id, firstPatient.address, quantity);
      alert(`Successfully dispensed ${quantity} units to ${firstPatient.name}!`);
      await loadAllData();
    } catch (error) {
      console.error('❌ Dispensing failed:', error);
      alert(`Dispensing failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900">🧪 Dispense Testing Laboratory</h1>
            <p className="mt-1 text-sm text-gray-600">
              Test the complete supply chain workflow: Transfer → Dispense → Track
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={loadAllData}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh All Data'}
              </button>
              <button
                onClick={testTransferToHospital}
                disabled={loading || distributorBatches.length === 0}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                🚛 Transfer to Hospital
              </button>
              <button
                onClick={testDispenseToPatient}
                disabled={loading || hospitalBatches.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                💊 Dispense to Patient
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📊</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Batches</dt>
                    <dd className="text-lg font-medium text-gray-900">{allBatches.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🚛</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">At Distributor</dt>
                    <dd className="text-lg font-medium text-gray-900">{distributorBatches.length}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">At Hospital</dt>
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
                  <div className="text-3xl">💊</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Dispensed</dt>
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
                  <div className="text-3xl">📋</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Units</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {allBatches.reduce((sum, batch) => sum + parseInt(batch.quantity || 0), 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Hospital Inventory */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">🏥 Hospital Inventory (Ready for Dispensing)</h2>
              {hospitalBatches.length > 0 ? (
                <div className="space-y-3">
                  {hospitalBatches.slice(0, 5).map((batch) => (
                    <div key={batch.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Batch #{batch.id}</p>
                        <p className="text-sm text-gray-600">{batch.drugName}</p>
                        <p className="text-sm text-gray-500">{parseInt(batch.quantity).toLocaleString()} units</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                        {getStatusText(batch.status)}
                      </span>
                    </div>
                  ))}
                  {hospitalBatches.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">...and {hospitalBatches.length - 5} more</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📦</div>
                  <p className="text-gray-600">No batches at hospital</p>
                  <p className="text-sm text-gray-500">Transfer batches from distributor first</p>
                </div>
              )}
            </div>
          </div>

          {/* Dispensed Medications */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">💊 Dispensed Medications</h2>
              {dispensedBatches.length > 0 ? (
                <div className="space-y-3">
                  {dispensedBatches.slice(0, 5).map((batch) => (
                    <div key={batch.id} className="flex justify-between items-center p-3 bg-purple-50 rounded-md">
                      <div>
                        <p className="font-medium">Batch #{batch.id}</p>
                        <p className="text-sm text-gray-600">{batch.drugName}</p>
                        <p className="text-sm text-gray-500">
                          Patient: {batch.currentHolder.slice(0, 6)}...{batch.currentHolder.slice(-4)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                        {getStatusText(batch.status)}
                      </span>
                    </div>
                  ))}
                  {dispensedBatches.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">...and {dispensedBatches.length - 5} more</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">💊</div>
                  <p className="text-gray-600">No medications dispensed yet</p>
                  <p className="text-sm text-gray-500">Dispense from hospital inventory</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sample Patients List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">👥 Available Patients for Dispensing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAMPLE_ACCOUNTS.patients.map((patient) => (
                <div key={patient.address} className="p-4 border border-gray-200 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">{patient.id}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">ID: {patient.id}</p>
                      <p className="text-xs text-gray-400">
                        {patient.address.slice(0, 10)}...{patient.address.slice(-8)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispenseTestPage;
