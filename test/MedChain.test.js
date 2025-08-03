const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("MedChain", function () {
  let medChain;
  let ipfsStorage;
  let drugVerification;
  let owner, manufacturer, distributor, hospital, patient, admin;
  let drugData;

  beforeEach(async function () {
    [owner, manufacturer, distributor, hospital, patient, admin] = await ethers.getSigners();

    // Deploy contracts
    const IPFSStorage = await ethers.getContractFactory("IPFSStorage");
    ipfsStorage = await IPFSStorage.deploy();

    const DrugVerification = await ethers.getContractFactory("DrugVerification");
    drugVerification = await DrugVerification.deploy();

    const MedChain = await ethers.getContractFactory("MedChain");
    medChain = await MedChain.deploy();

    // Grant roles
    await medChain.grantManufacturerRole(manufacturer.address);
    await medChain.grantDistributorRole(distributor.address);
    await medChain.grantHospitalRole(hospital.address);
    await medChain.grantPatientRole(patient.address);

    // Register hospital
    await medChain.registerHospital(
      hospital.address,
      "Test Hospital",
      0, // Urban
      50 // Stock threshold
    );

    // Prepare sample drug data for Merkle tree
    drugData = [
      { name: "Paracetamol", batch: "PAR001", expiry: "2025-12-31" },
      { name: "Aspirin", batch: "ASP001", expiry: "2025-11-30" },
      { name: "Ibuprofen", batch: "IBU001", expiry: "2025-10-31" }
    ];
  });

  describe("Role Management", function () {
    it("Should grant and check roles correctly", async function () {
      expect(await medChain.hasRole(await medChain.MANUFACTURER_ROLE(), manufacturer.address)).to.be.true;
      expect(await medChain.hasRole(await medChain.DISTRIBUTOR_ROLE(), distributor.address)).to.be.true;
      expect(await medChain.hasRole(await medChain.HOSPITAL_ROLE(), hospital.address)).to.be.true;
      expect(await medChain.hasRole(await medChain.PATIENT_ROLE(), patient.address)).to.be.true;
    });

    it("Should not allow non-admin to grant roles", async function () {
      await expect(
        medChain.connect(manufacturer).grantManufacturerRole(patient.address)
      ).to.be.revertedWith("Only admin can call this function");
    });
  });

  describe("Drug Batch Creation", function () {
    it("Should create a drug batch successfully", async function () {
      // Create Merkle tree from drug data
      const leaves = drugData.map(drug => 
        keccak256(JSON.stringify(drug))
      );
      const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      const merkleRoot = tree.getHexRoot();

      const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year from now

      await expect(
        medChain.connect(manufacturer).createDrugBatch(
          "Paracetamol",
          merkleRoot,
          "QmSampleIPFSHash123",
          100,
          expiryDate
        )
      ).to.emit(medChain, "DrugBatchCreated");

      const batch = await medChain.getDrugBatch(1);
      expect(batch.drugName).to.equal("Paracetamol");
      expect(batch.manufacturer).to.equal(manufacturer.address);
      expect(batch.quantity).to.equal(100);
    });

    it("Should not allow non-manufacturer to create batch", async function () {
      const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

      await expect(
        medChain.connect(distributor).createDrugBatch(
          "Aspirin",
          ethers.keccak256(ethers.toUtf8Bytes("test")),
          "QmSampleIPFSHash123",
          100,
          expiryDate
        )
      ).to.be.revertedWith("Only manufacturer can call this function");
    });
  });

  describe("Drug Transfer Workflow", function () {
    let batchId;
    let merkleRoot;

    beforeEach(async function () {
      // Create a batch first
      const leaves = drugData.map(drug => 
        keccak256(JSON.stringify(drug))
      );
      const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      merkleRoot = tree.getHexRoot();

      const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

      await medChain.connect(manufacturer).createDrugBatch(
        "Test Drug",
        merkleRoot,
        "QmSampleIPFSHash123",
        100,
        expiryDate
      );
      batchId = 1;
    });

    it("Should transfer from manufacturer to distributor", async function () {
      await expect(
        medChain.connect(manufacturer).transferToDistributor(batchId, distributor.address)
      ).to.emit(medChain, "DrugTransferred");

      const batch = await medChain.getDrugBatch(batchId);
      expect(batch.status).to.equal(1); // WithDistributor
      expect(batch.currentHolder).to.equal(distributor.address);
    });

    it("Should transfer from distributor to hospital", async function () {
      // First transfer to distributor
      await medChain.connect(manufacturer).transferToDistributor(batchId, distributor.address);

      await expect(
        medChain.connect(distributor).transferToHospital(batchId, hospital.address)
      ).to.emit(medChain, "DrugTransferred");

      const batch = await medChain.getDrugBatch(batchId);
      expect(batch.status).to.equal(2); // WithHospital
      expect(batch.currentHolder).to.equal(hospital.address);

      // Check hospital stock updated
      const hospitalData = await medChain.getHospital(hospital.address);
      expect(hospitalData.stockCount).to.equal(100);
    });

    it("Should dispense to patient", async function () {
      // Transfer through the chain
      await medChain.connect(manufacturer).transferToDistributor(batchId, distributor.address);
      await medChain.connect(distributor).transferToHospital(batchId, hospital.address);

      await expect(
        medChain.connect(hospital).dispenseToPatient(batchId, patient.address, 10)
      ).to.emit(medChain, "DrugTransferred");

      const batch = await medChain.getDrugBatch(batchId);
      expect(batch.quantity).to.equal(90); // 100 - 10

      // Check hospital stock updated
      const hospitalData = await medChain.getHospital(hospital.address);
      expect(hospitalData.stockCount).to.equal(90);
    });
  });

  describe("Drug Verification", function () {
    let batchId;
    let merkleTree;
    let merkleRoot;

    beforeEach(async function () {
      // Create Merkle tree
      const leaves = drugData.map(drug => 
        keccak256(JSON.stringify(drug))
      );
      merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      merkleRoot = merkleTree.getHexRoot();

      // Create batch
      const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      await medChain.connect(manufacturer).createDrugBatch(
        "Test Drug",
        merkleRoot,
        "QmSampleIPFSHash123",
        100,
        expiryDate
      );
      batchId = 1;
    });

    it("Should verify valid drug with correct proof", async function () {
      const leaf = keccak256(JSON.stringify(drugData[0]));
      const proof = merkleTree.getHexProof(leaf);

      const isValid = await medChain.verifyDrug(batchId, leaf, proof);
      expect(isValid).to.be.true;
    });

    it("Should reject invalid drug with incorrect proof", async function () {
      const invalidLeaf = keccak256(JSON.stringify({ name: "Fake Drug", batch: "FAKE001" }));
      const proof = merkleTree.getHexProof(keccak256(JSON.stringify(drugData[0])));

      const isValid = await medChain.verifyDrug(batchId, invalidLeaf, proof);
      expect(isValid).to.be.false;
    });

    it("Should emit verification event", async function () {
      const leaf = keccak256(JSON.stringify(drugData[0]));
      const proof = merkleTree.getHexProof(leaf);

      await expect(
        medChain.verifyAndLog(batchId, leaf, proof)
      ).to.emit(medChain, "DrugVerified");
    });
  });

  describe("Hospital Management", function () {
    it("Should register hospital correctly", async function () {
      const newHospital = distributor.address; // Using distributor address for testing
      
      await expect(
        medChain.registerHospital(
          newHospital,
          "New Hospital",
          1, // Rural
          25 // Stock threshold
        )
      ).to.emit(medChain, "HospitalRegistered");

      const hospitalData = await medChain.getHospital(newHospital);
      expect(hospitalData.name).to.equal("New Hospital");
      expect(hospitalData.hospitalType).to.equal(1); // Rural
      expect(hospitalData.stockThreshold).to.equal(25);
      expect(hospitalData.isActive).to.be.true;
    });

    it("Should calculate priority correctly for rural hospitals", async function () {
      // Register rural hospital
      const ruralHospital = distributor.address;
      await medChain.registerHospital(ruralHospital, "Rural Hospital", 1, 50);

      const priority = await medChain.calculatePriority(ruralHospital);
      expect(priority).to.equal(100); // 50 * 2 (RURAL_PRIORITY_MULTIPLIER)
    });
  });

  describe("Drug Requests", function () {
    it("Should create drug request", async function () {
      await expect(
        medChain.connect(hospital).requestDrugs(
          distributor.address,
          0, // batchId (can be 0 for new drugs)
          50,
          "Emergency shortage"
        )
      ).to.emit(medChain, "DrugRequested");

      const request = await medChain.getDrugRequest(1);
      expect(request.hospital).to.equal(hospital.address);
      expect(request.distributor).to.equal(distributor.address);
      expect(request.quantity).to.equal(50);
      expect(request.reason).to.equal("Emergency shortage");
    });

    it("Should approve drug request", async function () {
      // Create request
      await medChain.connect(hospital).requestDrugs(
        distributor.address,
        0,
        50,
        "Emergency shortage"
      );

      // Approve request
      await medChain.connect(distributor).approveRequest(1);

      const request = await medChain.getDrugRequest(1);
      expect(request.status).to.equal(1); // Approved
    });
  });

  describe("WHO Approved Drugs", function () {
    it("Should add and check WHO approved drugs", async function () {
      const drugHash = ethers.keccak256(ethers.toUtf8Bytes("Paracetamol-WHO"));

      await medChain.addWHOApprovedDrug(drugHash);
      const isApproved = await medChain.isWHOApproved(drugHash);
      expect(isApproved).to.be.true;
    });

    it("Should remove WHO approved drugs", async function () {
      const drugHash = ethers.keccak256(ethers.toUtf8Bytes("Paracetamol-WHO"));

      await medChain.addWHOApprovedDrug(drugHash);
      await medChain.removeWHOApprovedDrug(drugHash);
      
      const isApproved = await medChain.isWHOApproved(drugHash);
      expect(isApproved).to.be.false;
    });
  });

  describe("Health Records", function () {
    it("Should update patient health record", async function () {
      const ipfsHash = "QmPatientHealthRecord123";

      await expect(
        medChain.connect(hospital).updateHealthRecord(patient.address, ipfsHash)
      ).to.emit(medChain, "HealthRecordUpdated");

      const record = await medChain.connect(patient).getHealthRecord(patient.address);
      expect(record).to.equal(ipfsHash);
    });

    it("Should restrict health record access", async function () {
      const ipfsHash = "QmPatientHealthRecord123";
      await medChain.connect(hospital).updateHealthRecord(patient.address, ipfsHash);

      // Patient should access their own record
      const record = await medChain.connect(patient).getHealthRecord(patient.address);
      expect(record).to.equal(ipfsHash);

      // Other patients should not access
      await expect(
        medChain.connect(manufacturer).getHealthRecord(patient.address)
      ).to.be.revertedWith("Unauthorized access to health record");
    });
  });

  describe("Expired Drug Reporting", function () {
    let batchId;

    beforeEach(async function () {
      // Create and transfer batch to hospital
      const leaves = drugData.map(drug => 
        keccak256(JSON.stringify(drug))
      );
      const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      const merkleRoot = tree.getHexRoot();

      const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

      await medChain.connect(manufacturer).createDrugBatch(
        "Test Drug",
        merkleRoot,
        "QmSampleIPFSHash123",
        100,
        expiryDate
      );
      batchId = 1;

      // Transfer to hospital
      await medChain.connect(manufacturer).transferToDistributor(batchId, distributor.address);
      await medChain.connect(distributor).transferToHospital(batchId, hospital.address);
    });

    it("Should report expired drug", async function () {
      await expect(
        medChain.connect(hospital).reportExpiredDrug(batchId, "QmExpiredDrugEvidence123")
      ).to.emit(medChain, "ExpiredDrugReported");

      const batch = await medChain.getDrugBatch(batchId);
      expect(batch.status).to.equal(4); // Expired

      const report = await medChain.getExpiredReport(1);
      expect(report.batchId).to.equal(batchId);
      expect(report.reporter).to.equal(hospital.address);
    });

    it("Should verify expired drug report", async function () {
      await medChain.connect(hospital).reportExpiredDrug(batchId, "QmExpiredDrugEvidence123");
      await medChain.verifyExpiredReport(1);

      const report = await medChain.getExpiredReport(1);
      expect(report.verified).to.be.true;
    });
  });
});
