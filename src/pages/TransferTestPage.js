import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import { SAMPLE_ACCOUNTS } from '../config/contracts';

const TransferTestPage = () => {
  const { account } = useWallet();
  const { 
    getAllBatches, 
    getDistributorBatches, 
    getHospitalBatches, 
    transferToHospital,
    getTransferHistory 
  } = useContract();

  const [allBatches, setAllBatches] = useState([]);
  const [distributorBatches, setDistributorBatches] = useState([]);
  const [hospitalBatches, setHospitalBatches] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const distributorAccount = SAMPLE_ACCOUNTS.distributor.address;
  const hospitalAccount = SAMPLE_ACCOUNTS.hospital.address;

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading all test data...');
      
      const [all, dist, hosp, history] = await Promise.all([
        getAllBatches(),
        getDistributorBatches(distributorAccount),
        getHospitalBatches(hospitalAccount),
        getTransferHistory(distributorAccount)
      ]);

      setAllBatches(all);
      setDistributorBatches(dist);
      setHospitalBatches(hosp);
      setTransferHistory(history);

      console.log('✅ Test data loaded:', {
        all: all.length,
        distributor: dist.length,
        hospital: hosp.length,
        history: history.length
      });
    } catch (error) {
      console.error('❌ Error loading test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testHospitalTransfer = async () => {
    if (distributorBatches.length === 0) {
      alert('No batches available at distributor to transfer');
      return;
    }

    const firstBatch = distributorBatches[0];
    console.log('🔄 Testing hospital transfer for batch:', firstBatch.id);

    try {
      setLoading(true);
      await transferToHospital(firstBatch.id, hospitalAccount);
      console.log('✅ Hospital transfer completed successfully');
      
      // Reload data after transfer
      await loadAllData();
      
      alert(`Successfully transferred batch #${firstBatch.id} to hospital!`);
    } catch (error) {
      console.error('❌ Hospital transfer failed:', error);
      alert(`Transfer failed: ${error.message}`);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900">🧪 Transfer Test Page</h1>
            <p className="mt-1 text-sm text-gray-600">
              Test hospital transfer functionality and view complete supply chain data
            </p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={loadAllData}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
              <button
                onClick={testHospitalTransfer}
                disabled={loading || distributorBatches.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Test Hospital Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🏭</div>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">With Distributor</dt>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">With Hospital</dt>
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
                  <div className="text-3xl">📋</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Transfer History</dt>
                    <dd className="text-lg font-medium text-gray-900">{transferHistory.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Distributor Batches */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">🚛 Distributor Batches (Available for Transfer)</h2>
            {distributorBatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drug Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Holder</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {distributorBatches.map((batch) => (
                      <tr key={batch.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{batch.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.drugName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{parseInt(batch.quantity).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getStatusText(batch.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.currentHolder.slice(0, 6)}...{batch.currentHolder.slice(-4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No batches available at distributor</p>
            )}
          </div>
        </div>

        {/* Hospital Batches */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">🏥 Hospital Batches</h2>
            {hospitalBatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drug Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Holder</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hospitalBatches.map((batch) => (
                      <tr key={batch.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{batch.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.drugName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{parseInt(batch.quantity).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getStatusText(batch.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.currentHolder.slice(0, 6)}...{batch.currentHolder.slice(-4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No batches at hospital yet</p>
            )}
          </div>
        </div>

        {/* All Batches Overview */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">📊 All Batches Overview</h2>
            {allBatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drug Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Holder</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allBatches.map((batch) => (
                      <tr key={batch.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{batch.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.drugName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            batch.status === 2 ? 'bg-green-100 text-green-800' : 
                            batch.status === 1 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
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
              <p className="text-gray-500 text-center py-4">No batches found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferTestPage;
