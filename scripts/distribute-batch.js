const { ethers } = require("hardhat");

async function main() {
  console.log("=== Distributing Drug Batches ===\n");

  // Get accounts
  const [admin, manufacturer, distributor, hospital] = await ethers.getSigners();
  
  console.log("📋 Accounts:");
  console.log("Admin:", admin.address);
  console.log("Manufacturer:", manufacturer.address);
  console.log("Distributor:", distributor.address);
  console.log("Hospital:", hospital.address);
  console.log("");

  // Get contract
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const MedChain = await ethers.getContractFactory("MedChain");
  const contract = MedChain.attach(contractAddress);

  // Check current batch status
  console.log("📦 Checking current batches...");
  const currentBatchId = await contract.getCurrentBatchId();
  console.log(`Current batch ID: ${currentBatchId}`);

  // Check if distributor role exists
  const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
  const hasDistributorRole = await contract.hasRole(DISTRIBUTOR_ROLE, distributor.address);
  
  if (!hasDistributorRole) {
    console.log("\n🔑 Granting distributor role...");
    const grantTx = await contract.connect(admin).grantDistributorRole(distributor.address);
    await grantTx.wait();
    console.log(`✅ Distributor role granted to ${distributor.address}`);
  } else {
    console.log(`✅ ${distributor.address} already has distributor role`);
  }

  // Show available batches
  console.log("\n📋 Available batches for distribution:");
  for (let i = 1; i <= currentBatchId; i++) {
    const batch = await contract.getDrugBatch(i);
    const statusNames = ["Manufactured", "WithDistributor", "WithHospital", "DispensedToPatient", "Expired"];
    console.log(`Batch #${i}: ${batch[1]} (${batch[5]} units) - Status: ${statusNames[batch[8]]}`);
  }

  // Transfer first available batch to distributor
  console.log("\n🚚 Transferring batch to distributor...");
  
  // Find a manufactured batch
  let batchToTransfer = null;
  for (let i = 1; i <= currentBatchId; i++) {
    const batch = await contract.getDrugBatch(i);
    if (batch[8] === 0) { // Status: Manufactured
      batchToTransfer = i;
      break;
    }
  }

  if (batchToTransfer) {
    try {
      const transferTx = await contract.connect(manufacturer).transferToDistributor(
        batchToTransfer,
        distributor.address
      );
      await transferTx.wait();
      console.log(`✅ Batch #${batchToTransfer} transferred to distributor ${distributor.address}`);
      
      // Verify transfer
      const updatedBatch = await contract.getDrugBatch(batchToTransfer);
      const statusNames = ["Manufactured", "WithDistributor", "WithHospital", "DispensedToPatient", "Expired"];
      console.log(`✅ Updated status: ${statusNames[updatedBatch[8]]}`);
      console.log(`✅ Current holder: ${updatedBatch[9]}`);
      
    } catch (error) {
      console.error("❌ Error transferring batch:", error.message);
    }
  } else {
    console.log("❌ No manufactured batches available for transfer");
  }

  console.log("\n🎉 Distribution process complete!");
  console.log("\n📱 Next steps:");
  console.log("1. Switch to distributor account in MetaMask:");
  console.log(`   ${distributor.address}`);
  console.log("2. Go to distributor dashboard to view received batches");
  console.log("3. Transfer batches to hospitals when needed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
