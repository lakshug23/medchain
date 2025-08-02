// Simple test page to check if basic functionality works
import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';

const TestPage = () => {
  const { account } = useWallet();
  const { contract, getAllBatches, getManufacturerBatches } = useContract();
  const [testResults, setTestResults] = useState([]);

  const runTests = async () => {
    const results = [];
    
    // Test 1: Check wallet connection
    results.push(`✅ Wallet connected: ${account || 'NOT CONNECTED'}`);
    
    // Test 2: Check contract
    results.push(`✅ Contract initialized: ${contract ? 'YES' : 'NO'}`);
    
    if (contract && account) {
      try {
        // Test 3: Get all batches
        const allBatches = await getAllBatches();
        results.push(`✅ Total batches found: ${allBatches.length}`);
        
        // Test 4: Get manufacturer batches
        const manufacturerBatches = await getManufacturerBatches(account);
        results.push(`✅ Manufacturer batches: ${manufacturerBatches.length}`);
        
        // Test 5: Show batch details
        manufacturerBatches.forEach(batch => {
          results.push(`   Batch #${batch.id}: ${batch.drugName} (Status: ${batch.status})`);
        });
        
      } catch (error) {
        results.push(`❌ Error: ${error.message}`);
      }
    }
    
    setTestResults(results);
  };

  useEffect(() => {
    if (account && contract) {
      runTests();
    }
  }, [account, contract]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">MedChain Connection Test</h1>
      
      <button 
        onClick={runTests}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
      >
        Run Test
      </button>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Test Results:</h2>
        {testResults.map((result, index) => (
          <div key={index} className="font-mono text-sm mb-1">
            {result}
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Expected Manufacturer Account:</strong> 0x70997970C51812dc3A010C7d01b50e0d17dc79C8</p>
        <p><strong>Expected Batches:</strong> 8 total (3 should be transferable)</p>
      </div>
    </div>
  );
};

export default TestPage;
