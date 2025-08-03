const { ethers } = require("hardhat");

async function main() {
  console.log("Starting MedChain deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy IPFSStorage contract
  console.log("\nDeploying IPFSStorage...");
  const IPFSStorage = await ethers.getContractFactory("IPFSStorage");
  const ipfsStorage = await IPFSStorage.deploy();
  await ipfsStorage.waitForDeployment();
  console.log("IPFSStorage deployed to:", await ipfsStorage.getAddress());

  // Deploy DrugVerification contract
  console.log("\nDeploying DrugVerification...");
  const DrugVerification = await ethers.getContractFactory("DrugVerification");
  const drugVerification = await DrugVerification.deploy();
  await drugVerification.waitForDeployment();
  console.log("DrugVerification deployed to:", await drugVerification.getAddress());

  // Deploy MedChain main contract
  console.log("\nDeploying MedChain...");
  const MedChain = await ethers.getContractFactory("MedChain");
  const medChain = await MedChain.deploy();
  await medChain.waitForDeployment();
  console.log("MedChain deployed to:", await medChain.getAddress());

  // Setup initial configuration
  console.log("\nSetting up initial configuration...");
  
  // Add some sample WHO approved drugs (using mock hashes)
  const sampleWHODrugs = [
    ethers.keccak256(ethers.toUtf8Bytes("Paracetamol-WHO-2024")),
    ethers.keccak256(ethers.toUtf8Bytes("Aspirin-WHO-2024")),
    ethers.keccak256(ethers.toUtf8Bytes("Ibuprofen-WHO-2024"))
  ];

  for (const drugHash of sampleWHODrugs) {
    await medChain.addWHOApprovedDrug(drugHash);
    console.log("Added WHO approved drug:", drugHash);
  }

  // Create sample accounts with roles (for testing)
  const accounts = await ethers.getSigners();
  
  if (accounts.length >= 5) {
    const manufacturer = accounts[1].address;
    const distributor = accounts[2].address;
    const hospital1 = accounts[3].address;
    const patient = accounts[4].address;

    await medChain.grantManufacturerRole(manufacturer);
    await medChain.grantDistributorRole(distributor);
    await medChain.grantHospitalRole(hospital1);
    await medChain.grantPatientRole(patient);

    console.log("Granted roles to sample accounts:");
    console.log("Manufacturer:", manufacturer);
    console.log("Distributor:", distributor);
    console.log("Hospital:", hospital1);
    console.log("Patient:", patient);

    // Register a sample hospital
    await medChain.registerHospital(
      hospital1,
      "City General Hospital",
      0, // Urban
      100 // Stock threshold
    );
    console.log("Registered sample hospital:", hospital1);
  }

  console.log("\n=== Deployment Summary ===");
  console.log("IPFSStorage:", await ipfsStorage.getAddress());
  console.log("DrugVerification:", await drugVerification.getAddress());
  console.log("MedChain:", await medChain.getAddress());
  console.log("Deployer:", deployer.address);
  
  // Save deployment addresses to a file
  const deploymentInfo = {
    network: network.name,
    contracts: {
      IPFSStorage: await ipfsStorage.getAddress(),
      DrugVerification: await drugVerification.getAddress(),
      MedChain: await medChain.getAddress()
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  const fs = require("fs");
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }
  
  fs.writeFileSync(
    `deployments/${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\nDeployment info saved to deployments/${network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
