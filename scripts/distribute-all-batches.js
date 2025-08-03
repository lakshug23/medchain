const { ethers } = require("hardhat");

async function main() {
  console.log("=== Distributing All Remaining Batches ===\n");

  const [admin, manufacturer, distributor] = await ethers.getSigners();
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const MedChain = await ethers.getContractFactory("MedChain");
  const contract = MedChain.attach(contractAddress);

  const currentBatchId = await contract.getCurrentBatchId();
  
  console.log("🚚 Transferring all manufactured batches to distributor...\n");
  
  for (let i = 1; i <= currentBatchId; i++) {
    const batch = await contract.getDrugBatch(i);
    const status = batch[8];
    const drugName = batch[1];
    
    if (status === 0n) { // Manufactured
      try {
        console.log(`📦 Transferring Batch #${i} (${drugName})...`);
        const transferTx = await contract.connect(manufacturer).transferToDistributor(i, distributor.address);
        await transferTx.wait();
        console.log(`✅ Batch #${i} transferred successfully`);
      } catch (error) {
        console.log(`❌ Failed to transfer Batch #${i}: ${error.message}`);
      }
    } else {
      const statusNames = ["Manufactured", "WithDistributor", "WithHospital", "DispensedToPatient", "Expired"];
      console.log(`⏭️  Batch #${i} (${drugName}) already ${statusNames[status]}`);
    }
  }
  
  console.log("\n📊 Final Distribution Summary:");
  for (let i = 1; i <= currentBatchId; i++) {
    const batch = await contract.getDrugBatch(i);
    const statusNames = ["Manufactured", "WithDistributor", "WithHospital", "DispensedToPatient", "Expired"];
    console.log(`Batch #${i}: ${batch[1]} - ${statusNames[batch[8]]} (Holder: ${batch[9]})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
