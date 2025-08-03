const { ethers } = require("hardhat");

async function main() {
  console.log("=== Transfer Troubleshooting Guide ===\n");

  const [admin, manufacturer] = await ethers.getSigners();
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const MedChain = await ethers.getContractFactory("MedChain");
  const contract = MedChain.attach(contractAddress);

  console.log("📊 Current Batch Status Report:");
  console.log("Manufacturer Account:", manufacturer.address);
  console.log("");

  const currentBatchId = await contract.getCurrentBatchId();
  console.log(`Total Batches: ${currentBatchId}\n`);

  const statusNames = ["Manufactured", "WithDistributor", "WithHospital", "DispensedToPatient", "Expired"];
  let transferableBatches = [];

  for (let i = 1; i <= currentBatchId; i++) {
    const batch = await contract.getDrugBatch(i);
    const status = Number(batch[8]);
    const isTransferable = (status === 0);
    
    console.log(`Batch #${i}: ${batch[1]}`);
    console.log(`  Status: ${statusNames[status]} (${status})`);
    console.log(`  Quantity: ${batch[5]} units`);
    console.log(`  Current Holder: ${batch[9]}`);
    console.log(`  ✅ Can Transfer: ${isTransferable ? 'YES' : 'NO'}`);
    console.log("");

    if (isTransferable) {
      transferableBatches.push({ id: i, name: batch[1], quantity: batch[5] });
    }
  }

  console.log("🚚 TRANSFERABLE BATCHES SUMMARY:");
  if (transferableBatches.length > 0) {
    console.log(`✅ Found ${transferableBatches.length} batches ready for transfer:`);
    transferableBatches.forEach(batch => {
      console.log(`   - Batch #${batch.id}: ${batch.name} (${batch.quantity} units)`);
    });
    console.log("\n📱 In the UI, these batches should show green 'Transfer' buttons!");
  } else {
    console.log("❌ No batches available for transfer (all already distributed)");
    console.log("\n💡 Create a new batch to test transfer functionality:");
    console.log("   1. Go to manufacturer dashboard");
    console.log("   2. Fill out the 'Create New Batch' form");
    console.log("   3. Submit to create a new batch with 'Manufactured' status");
  }

  console.log("\n🔧 FRONTEND DEBUGGING STEPS:");
  console.log("1. Open: http://localhost:3000/manufacturer");
  console.log("2. Open browser console (F12)");
  console.log("3. Look for these debug messages:");
  console.log("   - '🔍 Will fetch batches 1 to 8...'");
  console.log("   - '🔍 Batch #X status: 0 type: number'");
  console.log("4. Check if you see green 'Transfer' buttons on the transferable batches listed above");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
