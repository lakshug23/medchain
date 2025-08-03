const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  console.log("=== Testing Contract Functions for Frontend ===");

  // Load deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync("deployments/localhost.json", "utf8"));
  const medChainAddress = deploymentInfo.contracts.MedChain;

  // Get contract instance
  const MedChain = await ethers.getContractFactory("MedChain");
  const medChain = MedChain.attach(medChainAddress);

  console.log("Contract address:", medChainAddress);

  try {
    // Test getCurrentBatchId function
    console.log("\n1. Testing getCurrentBatchId()...");
    const currentBatchId = await medChain.getCurrentBatchId();
    console.log("✅ Current Batch ID:", currentBatchId.toString());

    // Test getDrugBatch for each batch
    console.log("\n2. Testing getDrugBatch() for each batch...");
    if (currentBatchId > 0) {
      for (let i = 1; i <= currentBatchId; i++) {
        try {
          const batch = await medChain.getDrugBatch(i);
          console.log(`✅ Batch #${i} retrieved successfully:`);
          console.log(`   Drug Name: ${batch.drugName}`);
          console.log(`   Manufacturer: ${batch.manufacturer}`);
          console.log(`   Quantity: ${batch.quantity.toString()}`);
          console.log(`   Status: ${batch.status}`);
        } catch (error) {
          console.log(`❌ Error fetching batch #${i}:`, error.message);
        }
      }

      // Test filtering by manufacturer
      console.log("\n3. Testing manufacturer filtering...");
      const manufacturerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // From our deployment
      let manufacturerBatches = [];
      
      for (let i = 1; i <= currentBatchId; i++) {
        try {
          const batch = await medChain.getDrugBatch(i);
          if (batch.manufacturer.toLowerCase() === manufacturerAddress.toLowerCase()) {
            manufacturerBatches.push({
              id: i,
              drugName: batch.drugName,
              manufacturer: batch.manufacturer,
              quantity: batch.quantity.toString(),
              status: batch.status
            });
          }
        } catch (error) {
          console.log(`Error filtering batch #${i}:`, error.message);
        }
      }

      console.log(`✅ Found ${manufacturerBatches.length} batches for manufacturer ${manufacturerAddress}:`);
      manufacturerBatches.forEach(batch => {
        console.log(`   - Batch #${batch.id}: ${batch.drugName} (${batch.quantity} units)`);
      });

    } else {
      console.log("❌ No batches found");
    }

  } catch (error) {
    console.error("❌ Error during testing:", error);
  }
}

main().catch(console.error);
