const { ethers } = require("hardhat");

async function main() {
  console.log("=== Debugging Batch Transfer ===\n");

  // Get accounts
  const [admin, manufacturer, distributor] = await ethers.getSigners();
  
  // Get contract
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const MedChain = await ethers.getContractFactory("MedChain");
  const contract = MedChain.attach(contractAddress);

  console.log("🔍 Detailed batch analysis:");
  const batch1 = await contract.getDrugBatch(1);
  console.log("Batch #1 details:");
  console.log("- Drug Name:", batch1[1]);
  console.log("- Manufacturer:", batch1[2]);
  console.log("- Status (raw):", batch1[8].toString());
  console.log("- Current Holder:", batch1[9]);
  console.log("- Expected Manufacturer:", manufacturer.address);
  console.log("- Manufacturer matches:", batch1[2].toLowerCase() === manufacturer.address.toLowerCase());

  // Try the transfer
  console.log("\n🚚 Attempting transfer...");
  try {
    console.log("Using manufacturer account:", manufacturer.address);
    console.log("Transferring to distributor:", distributor.address);
    
    const transferTx = await contract.connect(manufacturer).transferToDistributor(1, distributor.address);
    await transferTx.wait();
    console.log("✅ Transfer successful!");
    
    // Check updated batch
    const updatedBatch = await contract.getDrugBatch(1);
    console.log("Updated status:", updatedBatch[8].toString());
    console.log("Updated holder:", updatedBatch[9]);
    
  } catch (error) {
    console.error("❌ Transfer failed:", error);
    
    // Check requirements
    console.log("\n🔍 Checking transfer requirements:");
    
    // Check distributor role
    const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
    const hasRole = await contract.hasRole(DISTRIBUTOR_ROLE, distributor.address);
    console.log("Distributor has role:", hasRole);
    
    // Check manufacturer role
    const MANUFACTURER_ROLE = await contract.MANUFACTURER_ROLE();
    const hasManufacturerRole = await contract.hasRole(MANUFACTURER_ROLE, manufacturer.address);
    console.log("Manufacturer has role:", hasManufacturerRole);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
