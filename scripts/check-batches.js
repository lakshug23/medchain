const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  console.log("=== Checking Existing Drug Batches ===");

  // Load deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync("deployments/localhost.json", "utf8"));
  const medChainAddress = deploymentInfo.contracts.MedChain;

  // Get contract instance
  const MedChain = await ethers.getContractFactory("MedChain");
  const medChain = MedChain.attach(medChainAddress);

  console.log("Contract address:", medChainAddress);

  try {
    // Get current batch ID
    const currentBatchId = await medChain.getCurrentBatchId();
    console.log("Current Batch ID:", currentBatchId.toString());

    if (currentBatchId > 0) {
      console.log("\n=== Existing Batches ===");
      
      // Loop through all batches and display them
      for (let i = 1; i <= currentBatchId; i++) {
        try {
          const batch = await medChain.getDrugBatch(i);
          console.log(`\nBatch #${i}:`);
          console.log(`  Drug Name: ${batch.drugName}`);
          console.log(`  Manufacturer: ${batch.manufacturer}`);
          console.log(`  Current Holder: ${batch.currentHolder}`);
          console.log(`  Quantity: ${batch.quantity.toString()}`);
          console.log(`  Status: ${batch.status}`);
          console.log(`  Merkle Root: ${batch.merkleRoot}`);
          console.log(`  IPFS Hash: ${batch.ipfsHash}`);
          console.log(`  Created: ${new Date(Number(batch.createdAt) * 1000).toISOString()}`);
          console.log(`  Expiry: ${new Date(Number(batch.expiryDate) * 1000).toISOString()}`);
        } catch (error) {
          console.log(`  Error fetching batch #${i}:`, error.message);
        }
      }
    } else {
      console.log("No batches found.");
    }
  } catch (error) {
    console.error("Error checking batches:", error);
  }
}

main().catch(console.error);
