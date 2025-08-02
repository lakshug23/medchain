// Test page specifically for distributor debugging
import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';

const DistributorTestPage = () => {
  const { account } = useWallet();
  const { contract, getAllBatches, getDistributorBatches } = useContract();
  const [testResults, setTestResults] = useState([]);

  const runDistributorTests = async () => {
    const results = [];
    const expectedDistributor = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    
    // Test 1: Check account
    results.push(`✅ Connected account: ${account || 'NOT CONNECTED'}`);
    results.push(`✅ Expected distributor: ${expectedDistributor}`);
    results.push(`✅ Account matches: ${account?.toLowerCase() === expectedDistributor.toLowerCase()}`);
    
    // Test 2: Check contract
    results.push(`✅ Contract initialized: ${contract ? 'YES' : 'NO'}`);
    
    if (contract) {
      try {
        // Test 3: Get all batches
        const allBatches = await getAllBatches();
        results.push(`✅ Total batches found: ${allBatches.length}`);
        
        // Test 4: Filter manually
        const distributorBatches = allBatches.filter(batch => {
          const holderMatches = batch.currentHolder.toLowerCase() === expectedDistributor.toLowerCase();
          const statusMatches = (batch.status === 1 || batch.status === '1' || Number(batch.status) === 1);
          return holderMatches && statusMatches;
        });
        
        results.push(`✅ Distributor batches (manual filter): ${distributorBatches.length}`);
        
        // Test 5: Use getDistributorBatches function
        if (account) {
          const functionBatches = await getDistributorBatches(account);
          results.push(`✅ Distributor batches (function): ${functionBatches.length}`);
        }
        
        // Test 6: Show batch details
        results.push(`\n📦 Batches held by distributor ${expectedDistributor}:`);
        distributorBatches.forEach(batch => {
          results.push(`   #${batch.id}: ${batch.drugName} (${batch.quantity} units) - Status: ${batch.status}`);
        });
        
        // Test 7: Show all batch holders
        results.push(`\n📋 All batch holders:`);
        allBatches.forEach(batch => {
          results.push(`   #${batch.id}: Holder ${batch.currentHolder.slice(0, 6)}...${batch.currentHolder.slice(-4)} - Status: ${batch.status}`);
        });
        
      } catch (error) {
        results.push(`❌ Error: ${error.message}`);
      }
    }
    
    setTestResults(results);
  };

  useEffect(() => {
    if (account && contract) {
      runDistributorTests();
    }
  }, [account, contract]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Distributor Connection Test</h1>
      
      <button 
        onClick={runDistributorTests}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
      >
        Run Distributor Test
      </button>
      
      <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
        <h2 className="font-bold mb-2">Test Results:</h2>
        {testResults.map((result, index) => (
          <div key={index} className="font-mono text-sm mb-1 whitespace-pre-line">
            {result}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributorTestPage;
