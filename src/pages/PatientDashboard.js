import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import { SAMPLE_ACCOUNTS } from '../config/contracts';
import RoleProtection, { RoleStatus, RoleGate } from '../components/RoleProtection';

const PatientDashboard = () => {
  const { account } = useWallet();
  const { userRole, getPatientBatches, setupPatientRoles } = useContract();
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (account) {
      // Check if current account is in the sample patients
      const currentPatient = SAMPLE_ACCOUNTS.patients.find(
        p => p.address.toLowerCase() === account.toLowerCase()
      );
      if (currentPatient) {
        setSelectedPatient(currentPatient);
        loadPatientData(account);
      } else {
        // If not a sample patient, still try to load data
        loadPatientData(account);
      }
    }
  }, [account]);

  const loadPatientData = async (patientAddress = account) => {
    if (!patientAddress) return;
    
    try {
      setLoading(true);
      console.log('🔍 Loading patient data for:', patientAddress);
      
      const batches = await getPatientBatches(patientAddress);
      console.log('✅ Patient medication history loaded:', batches);
      setMedicationHistory(batches);
    } catch (error) {
      console.error('❌ Error loading patient data:', error);
      console.error('Error details:', error.message);
      setMedicationHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    loadPatientData(patient.address);
  };

  const handleSetupRoles = async () => {
    try {
      setLoading(true);
      await setupPatientRoles();
      alert('Patient roles setup completed! You can now test dispensing medications.');
    } catch (error) {
      console.error('Error setting up patient roles:', error);
      alert(`Error setting up patient roles: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
                <h1 className="text-3xl font-bold text-gray-900">👤 Patient Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  View medication history and track dispensed prescriptions
                </p>
                {account && (
                  <p className="mt-2 text-sm text-gray-500">
                    Connected as: {account.slice(0, 6)}...{account.slice(-4)}
                    {selectedPatient && ` - ${selectedPatient.name} (${selectedPatient.id})`}
                  </p>
                )}
              </div>
              <button
                onClick={handleSetupRoles}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Setup Patient Roles'}
              </button>
            </div>
          </div>
        </div>

        {/* Patient Selection for Testing */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">👥 Select Patient (for Testing)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAMPLE_ACCOUNTS.patients.map((patient) => (
                <div
                  key={patient.address}
                  onClick={() => handlePatientSelect(patient)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedPatient?.address === patient.address
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{patient.id}</span>
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">💊</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Dispensed Medications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {medicationHistory.length}
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
                      Total Units
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {medicationHistory.reduce((sum, batch) => sum + parseInt(batch.quantity || 0), 0).toLocaleString()}
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
                      Patient Status
                    </dt>
                    <dd className="text-lg font-medium text-green-600">
                      Active
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medication History */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">💊 My Medication History</h2>
              <button
                onClick={() => loadPatientData(selectedPatient?.address || account)}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading medication history...</p>
              </div>
            ) : medicationHistory.length > 0 ? (
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {medicationHistory.map((batch) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">💊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No medications dispensed</h3>
                <p className="text-gray-600">
                  {selectedPatient 
                    ? `No medications have been dispensed to ${selectedPatient.name} yet.`
                    : 'No medications have been dispensed to this patient yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Patient Information */}
        {selectedPatient && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">👤 Patient Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="text-sm text-gray-900">{selectedPatient.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Patient ID</dt>
                      <dd className="text-sm text-gray-900">{selectedPatient.id}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
                      <dd className="text-sm text-gray-900 font-mono">{selectedPatient.address}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Medications</dt>
                      <dd className="text-sm text-gray-900">{medicationHistory.length} batches</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
