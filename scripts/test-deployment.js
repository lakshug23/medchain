const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Testing MedChain deployment...");

  // Load deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync("deployments/localhost.json", "utf8"));
  const medChainAddress = deploymentInfo.contracts.MedChain;

  // Get contract instance
  const MedChain = await ethers.getContractFactory("MedChain");
  const medChain = MedChain.attach(medChainAddress);

  // Get accounts
  const [admin, manufacturer, distributor, hospital, patient] = await ethers.getSigners();

  console.log("Contract address:", medChainAddress);
  console.log("Admin:", admin.address);
  console.log("Manufacturer:", manufacturer.address);

  // Check if manufacturer has role
  const manufacturerRole = await medChain.MANUFACTURER_ROLE();
  const hasRole = await medChain.hasRole(manufacturerRole, manufacturer.address);
  console.log("Manufacturer has role:", hasRole);

  if (hasRole) {
    console.log("Creating a sample drug batch...");
    
    // Create a sample drug batch
    const drugName = "Sample Aspirin";
    const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("sample-merkle-root"));
    const ipfsHash = "QmSampleIPFSHash123";
    const quantity = 1000;
    const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year from now

    const tx = await medChain.connect(manufacturer).createDrugBatch(
      drugName,
      merkleRoot,
      ipfsHash,
      quantity,
      expiryDate
    );

    const receipt = await tx.wait();
    console.log("Drug batch created successfully!");
    console.log("Transaction hash:", receipt.hash);

    // Get batch info
    const batchId = 1; // First batch
    const batch = await medChain.getDrugBatch(batchId);
    console.log("Batch info:", {
      id: batchId,
      name: batch.name,
      manufacturer: batch.manufacturer,
      currentOwner: batch.currentOwner,
      quantity: batch.quantity.toString(),
      status: batch.status
    });
  }

  console.log("Testing complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
