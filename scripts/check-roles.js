const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 Checking ALL Role Assignments...");

  // Load deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync("deployments/localhost.json", "utf8"));
  const medChainAddress = deploymentInfo.contracts.MedChain;

  // Get contract instance
  const MedChain = await ethers.getContractFactory("MedChain");
  const medChain = MedChain.attach(medChainAddress);

  // Get accounts
  const [admin, manufacturer, distributor, hospital, patient] = await ethers.getSigners();

  console.log("📋 Contract Address:", medChainAddress);
  console.log("\n🔑 Account Addresses:");
  console.log("Admin:", admin.address);
  console.log("Manufacturer:", manufacturer.address);
  console.log("Distributor:", distributor.address);
  console.log("Hospital:", hospital.address);
  console.log("Patient:", patient.address);

  // Get role constants
  const DEFAULT_ADMIN_ROLE = await medChain.DEFAULT_ADMIN_ROLE();
  const MANUFACTURER_ROLE = await medChain.MANUFACTURER_ROLE();
  const DISTRIBUTOR_ROLE = await medChain.DISTRIBUTOR_ROLE();
  const HOSPITAL_ROLE = await medChain.HOSPITAL_ROLE();
  const PATIENT_ROLE = await medChain.PATIENT_ROLE();

  console.log("\n✅ Role Assignment Check:");

  // Check Admin role
  const isAdmin = await medChain.hasRole(DEFAULT_ADMIN_ROLE, admin.address);
  console.log(`Admin (${admin.address}): ${isAdmin ? '✅ HAS ROLE' : '❌ NO ROLE'}`);

  // Check Manufacturer role
  const isManufacturer = await medChain.hasRole(MANUFACTURER_ROLE, manufacturer.address);
  console.log(`Manufacturer (${manufacturer.address}): ${isManufacturer ? '✅ HAS ROLE' : '❌ NO ROLE'}`);

  // Check Distributor role
  const isDistributor = await medChain.hasRole(DISTRIBUTOR_ROLE, distributor.address);
  console.log(`Distributor (${distributor.address}): ${isDistributor ? '✅ HAS ROLE' : '❌ NO ROLE'}`);

  // Check Hospital role
  const isHospital = await medChain.hasRole(HOSPITAL_ROLE, hospital.address);
  console.log(`Hospital (${hospital.address}): ${isHospital ? '✅ HAS ROLE' : '❌ NO ROLE'}`);

  // Check Patient role
  const isPatient = await medChain.hasRole(PATIENT_ROLE, patient.address);
  console.log(`Patient (${patient.address}): ${isPatient ? '✅ HAS ROLE' : '❌ NO ROLE'}`);

  // If any roles are missing, grant them
  console.log("\n🔧 Fixing Missing Roles...");

  if (!isManufacturer) {
    console.log("Granting Manufacturer role...");
    await medChain.grantManufacturerRole(manufacturer.address);
  }

  if (!isDistributor) {
    console.log("Granting Distributor role...");
    await medChain.grantDistributorRole(distributor.address);
  }

  if (!isHospital) {
    console.log("Granting Hospital role...");
    await medChain.grantHospitalRole(hospital.address);
  }

  if (!isPatient) {
    console.log("Granting Patient role...");
    await medChain.grantPatientRole(patient.address);
  }

  console.log("\n🎯 Final Role Check:");
  const finalManufacturer = await medChain.hasRole(MANUFACTURER_ROLE, manufacturer.address);
  const finalDistributor = await medChain.hasRole(DISTRIBUTOR_ROLE, distributor.address);
  const finalHospital = await medChain.hasRole(HOSPITAL_ROLE, hospital.address);
  const finalPatient = await medChain.hasRole(PATIENT_ROLE, patient.address);

  console.log(`Manufacturer: ${finalManufacturer ? '✅' : '❌'}`);
  console.log(`Distributor: ${finalDistributor ? '✅' : '❌'}`);
  console.log(`Hospital: ${finalHospital ? '✅' : '❌'}`);
  console.log(`Patient: ${finalPatient ? '✅' : '❌'}`);

  console.log("\n🚀 All roles should now be properly assigned!");
  console.log("Try connecting with your accounts again in the frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
