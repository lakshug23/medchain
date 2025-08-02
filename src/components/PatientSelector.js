import React, { useState } from 'react';
import { SAMPLE_ACCOUNTS } from '../config/contracts';

const PatientSelector = ({ selectedPatient, onPatientSelect, onManualInput, showManualInput = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);

  const filteredPatients = SAMPLE_ACCOUNTS.patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (patient) => {
    onPatientSelect(patient);
    setSearchTerm('');
  };

  const handleManualInput = (address) => {
    onManualInput(address);
    setIsManualMode(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Patient
        </label>
        
        {/* Search Bar */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID, or address..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Patient List */}
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
          {filteredPatients.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.address}
                  onClick={() => handlePatientClick(patient)}
                  className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedPatient?.address === patient.address ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{patient.id}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-500">Patient ID: {patient.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-mono">
                        {patient.address.slice(0, 6)}...{patient.address.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No patients found matching your search.' : 'No patients available.'}
            </div>
          )}
        </div>
      </div>

      {/* Manual Input Option */}
      {showManualInput && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Or Enter Patient Address Manually
            </label>
            <button
              type="button"
              onClick={() => setIsManualMode(!isManualMode)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isManualMode ? 'Cancel' : 'Manual Entry'}
            </button>
          </div>
          
          {isManualMode && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="0x... (Ethereum address)"
                onChange={(e) => handleManualInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Enter a valid Ethereum address for patients not in the database.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected Patient Display */}
      {selectedPatient && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-900">
                {selectedPatient.name || 'Manual Entry'} 
                {selectedPatient.id && ` (${selectedPatient.id})`}
              </p>
              <p className="text-sm text-green-700">
                {selectedPatient.address}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSelector;
