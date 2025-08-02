import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import { SAMPLE_ACCOUNTS } from '../config/contracts';
import { RoleStatus } from '../components/RoleProtection';

const AdminDashboard = () => {
  const { account } = useWallet();
  const { userRole, grantRole, registerHospital, addWHOApprovedDrug, setupAllRoles } = useContract();
  const [loading, setLoading] = useState(false);
  
  // Role management state
  const [roleForm, setRoleForm] = useState({
    address: '',
    role: 'MANUFACTURER'
  });

  // Hospital registration state
  const [hospitalForm, setHospitalForm] = useState({
    address: '',
    name: '',
    type: '0', // 0 for Urban, 1 for Rural
    threshold: ''
  });

  // WHO drug state
  const [whoDrugName, setWhoDrugName] = useState('');

  const handleSetupAllRoles = async () => {
    try {
      setLoading(true);
      await setupAllRoles();
      alert('All roles have been set up successfully! All sample accounts now have appropriate access.');
    } catch (error) {
      console.error('Error setting up roles:', error);
      alert(`Error setting up roles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getAllSampleAccounts = () => {
    const accounts = [];
    
    // Add main roles
    accounts.push({ ...SAMPLE_ACCOUNTS.manufacturer, role: 'MANUFACTURER' });
    accounts.push({ ...SAMPLE_ACCOUNTS.distributor, role: 'DISTRIBUTOR' });
    accounts.push({ ...SAMPLE_ACCOUNTS.hospital, role: 'HOSPITAL' });
    
    // Add patients
    SAMPLE_ACCOUNTS.patients.forEach(patient => {
      accounts.push({ ...patient, role: 'PATIENT' });
    });
    
    return accounts;
  };

  const handleGrantRole = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await grantRole(roleForm.role, roleForm.address);
      setRoleForm({ address: '', role: 'MANUFACTURER' });
      alert('Role granted successfully!');
    } catch (error) {
      console.error('Error granting role:', error);
      alert('Error granting role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterHospital = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await registerHospital(
        hospitalForm.address,
        hospitalForm.name,
        parseInt(hospitalForm.type),
        parseInt(hospitalForm.threshold)
      );
      setHospitalForm({ address: '', name: '', type: '0', threshold: '' });
      alert('Hospital registered successfully!');
    } catch (error) {
      console.error('Error registering hospital:', error);
      alert('Error registering hospital: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWHODrug = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { ethers } = require('ethers');
      const drugHash = ethers.keccak256(ethers.toUtf8Bytes(whoDrugName + '-WHO-2024'));
      await addWHOApprovedDrug(drugHash);
      setWhoDrugName('');
      alert('WHO approved drug added successfully!');
    } catch (error) {
      console.error('Error adding WHO drug:', error);
      alert('Error adding WHO drug: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">⚡ Admin Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  System administration and role management
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

        {/* Quick Setup */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">🚀 Quick Setup</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Set up all sample accounts
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>This will grant appropriate roles to all sample accounts for testing the complete supply chain workflow.</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleSetupAllRoles}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Setting up roles...' : 'Setup All Sample Roles'}
            </button>
          </div>
        </div>

        {/* Sample Accounts Overview */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">👥 Sample Accounts</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Required Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getAllSampleAccounts().map((account, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {account.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {account.address.slice(0, 10)}...{account.address.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          account.role === 'MANUFACTURER' ? 'bg-blue-100 text-blue-800' :
                          account.role === 'DISTRIBUTOR' ? 'bg-yellow-100 text-yellow-800' :
                          account.role === 'HOSPITAL' ? 'bg-green-100 text-green-800' :
                          account.role === 'PATIENT' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {account.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.id || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Role Management */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Grant User Roles</h2>
            
            <form onSubmit={handleGrantRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Address
                </label>
                <input
                  type="text"
                  value={roleForm.address}
                  onChange={(e) => setRoleForm({...roleForm, address: e.target.value})}
                  placeholder="0x..."
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={roleForm.role}
                  onChange={(e) => setRoleForm({...roleForm, role: e.target.value})}
                  className="input-field"
                >
                  <option value="MANUFACTURER">Manufacturer</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                  <option value="HOSPITAL">Hospital</option>
                  <option value="PATIENT">Patient</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Granting...' : 'Grant Role'}
              </button>
            </form>
          </div>

          {/* Hospital Registration */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Register Hospital</h2>
            
            <form onSubmit={handleRegisterHospital} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Address
                </label>
                <input
                  type="text"
                  value={hospitalForm.address}
                  onChange={(e) => setHospitalForm({...hospitalForm, address: e.target.value})}
                  placeholder="0x..."
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={hospitalForm.name}
                  onChange={(e) => setHospitalForm({...hospitalForm, name: e.target.value})}
                  placeholder="General Hospital"
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Type
                </label>
                <select
                  value={hospitalForm.type}
                  onChange={(e) => setHospitalForm({...hospitalForm, type: e.target.value})}
                  className="input-field"
                >
                  <option value="0">Urban</option>
                  <option value="1">Rural</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Threshold
                </label>
                <input
                  type="number"
                  value={hospitalForm.threshold}
                  onChange={(e) => setHospitalForm({...hospitalForm, threshold: e.target.value})}
                  placeholder="100"
                  className="input-field"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-success w-full"
              >
                {loading ? 'Registering...' : 'Register Hospital'}
              </button>
            </form>
          </div>

          {/* WHO Drug Management */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">WHO Approved Drugs</h2>
            
            <form onSubmit={handleAddWHODrug} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drug Name
                </label>
                <input
                  type="text"
                  value={whoDrugName}
                  onChange={(e) => setWhoDrugName(e.target.value)}
                  placeholder="Paracetamol"
                  className="input-field"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-warning w-full"
              >
                {loading ? 'Adding...' : 'Add WHO Approved Drug'}
              </button>
            </form>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This will create a hash for the drug name with WHO-2024 suffix
              </p>
            </div>
          </div>

          {/* System Stats */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">System Statistics</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-blue-600">Total Batches</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-xl font-bold text-green-600">0</div>
                  <div className="text-sm text-green-600">Active Hospitals</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-purple-600">Total Users</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded">
                  <div className="text-xl font-bold text-yellow-600">0</div>
                  <div className="text-sm text-yellow-600">WHO Drugs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent System Activity</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
            <p className="text-sm">System events and transactions will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
