import React, { useState } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';

const HealthRecords = () => {
  const { account } = useWallet();
  const { getHealthRecord, updateHealthRecord, userRole } = useContract();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [healthRecord, setHealthRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newRecordData, setNewRecordData] = useState('');

  const loadHealthRecord = async () => {
    if (!selectedPatient) {
      alert('Please enter a patient address');
      return;
    }

    setLoading(true);
    try {
      const record = await getHealthRecord(selectedPatient);
      setHealthRecord(record);
    } catch (error) {
      console.error('Error loading health record:', error);
      setHealthRecord(null);
      alert('Health record not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async () => {
    if (!selectedPatient || !newRecordData) {
      alert('Please fill in all fields');
      return;
    }

    if (userRole !== 'HOSPITAL') {
      alert('Only hospitals can update health records');
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would upload to IPFS first
      const mockIPFSHash = 'QmHealthRecord' + Date.now();
      
      await updateHealthRecord(selectedPatient, mockIPFSHash);
      alert('Health record updated successfully!');
      setNewRecordData('');
    } catch (error) {
      console.error('Error updating health record:', error);
      alert('Error updating health record: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📋 Health Records Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Secure, blockchain-based health record system with IPFS storage and 
            role-based access control.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Health Record Access */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Access Health Record
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Address
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    placeholder="0x... or enter your own address"
                    className="input-field flex-1"
                  />
                  <button
                    onClick={() => setSelectedPatient(account)}
                    className="btn-secondary px-4"
                    title="Use my address"
                  >
                    Me
                  </button>
                </div>
              </div>

              <button
                onClick={loadHealthRecord}
                disabled={loading || !selectedPatient}
                className="btn-primary w-full"
              >
                {loading ? 'Loading...' : '📋 Load Health Record'}
              </button>
            </div>

            {/* Health Record Display */}
            {healthRecord && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="text-green-600 text-xl mr-3">✅</div>
                  <div>
                    <h4 className="text-green-800 font-medium">Health Record Found</h4>
                    <p className="text-green-600 text-sm">Record is securely stored on IPFS</p>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">IPFS Hash:</span>
                    <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                      {healthRecord.slice(0, 20)}...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {healthRecord === null && selectedPatient && !loading && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-yellow-600 text-xl mr-3">⚠️</div>
                  <div>
                    <h4 className="text-yellow-800 font-medium">No Record Found</h4>
                    <p className="text-yellow-600 text-sm">
                      No health record exists for this address or access is denied
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Health Record Management (Hospital Only) */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Update Health Record
              {userRole !== 'HOSPITAL' && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Hospital access only)
                </span>
              )}
            </h2>

            {userRole === 'HOSPITAL' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Address
                  </label>
                  <input
                    type="text"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    placeholder="0x..."
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Health Record Data (JSON)
                  </label>
                  <textarea
                    value={newRecordData}
                    onChange={(e) => setNewRecordData(e.target.value)}
                    placeholder={`{
  "patientId": "P123456",
  "visitDate": "2024-01-15",
  "diagnosis": "Routine checkup",
  "medications": ["Paracetamol 500mg"],
  "notes": "Patient in good health",
  "doctor": "Dr. Smith",
  "nextVisit": "2024-07-15"
}`}
                    rows={8}
                    className="input-field font-mono text-sm"
                  />
                </div>

                <button
                  onClick={handleUpdateRecord}
                  disabled={loading || !selectedPatient || !newRecordData}
                  className="btn-success w-full"
                >
                  {loading ? 'Updating...' : '💾 Update Health Record'}
                </button>

                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                  <p><strong>Note:</strong> In production, this data would be encrypted before uploading to IPFS</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🏥</div>
                <p className="mb-2">Hospital Access Required</p>
                <p className="text-sm">Only registered hospitals can update health records</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12 card">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            🔒 Health Record Security Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-3">🔐</div>
              <h4 className="font-semibold text-gray-900 mb-2">Encryption</h4>
              <p className="text-sm text-gray-600">
                Records are encrypted before storage to ensure patient privacy
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-3">🌐</div>
              <h4 className="font-semibold text-gray-900 mb-2">IPFS Storage</h4>
              <p className="text-sm text-gray-600">
                Decentralized storage ensures data availability and integrity
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-3">👥</div>
              <h4 className="font-semibold text-gray-900 mb-2">Access Control</h4>
              <p className="text-sm text-gray-600">
                Role-based permissions control who can view and update records
              </p>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📖 How to Use Health Records
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">For Patients:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Enter your wallet address to view your records</li>
                <li>• Only you and authorized hospitals can access your data</li>
                <li>• Records are stored securely on IPFS</li>
                <li>• You maintain control over your health information</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">For Hospitals:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Update patient records after consultations</li>
                <li>• Access records for patients under your care</li>
                <li>• Ensure data compliance with medical standards</li>
                <li>• Maintain audit trail of all record updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;
