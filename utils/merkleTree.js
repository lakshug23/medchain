const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

/**
 * Utility functions for creating and managing Merkle trees for drug batches
 */

class DrugMerkleTree {
  constructor(drugs) {
    this.drugs = drugs;
    this.leaves = this.drugs.map(drug => this.hashDrug(drug));
    this.tree = new MerkleTree(this.leaves, keccak256, { sortPairs: true });
  }

  /**
   * Hash drug data to create leaf node
   */
  hashDrug(drug) {
    const drugString = JSON.stringify({
      name: drug.name,
      batchNumber: drug.batchNumber,
      manufacturer: drug.manufacturer,
      manufactureDate: drug.manufactureDate,
      expiryDate: drug.expiryDate,
      serialNumber: drug.serialNumber,
      additionalData: drug.additionalData || ""
    });
    return keccak256(drugString);
  }

  /**
   * Get Merkle root
   */
  getRoot() {
    return this.tree.getHexRoot();
  }

  /**
   * Get proof for a specific drug
   */
  getProof(drug) {
    const leaf = this.hashDrug(drug);
    return this.tree.getHexProof(leaf);
  }

  /**
   * Verify a drug against the tree
   */
  verify(drug, proof) {
    const leaf = this.hashDrug(drug);
    return this.tree.verify(proof, leaf, this.getRoot());
  }

  /**
   * Get all leaves (drug hashes)
   */
  getLeaves() {
    return this.leaves.map(leaf => leaf.toString('hex'));
  }

  /**
   * Find drug by hash
   */
  findDrugByHash(hash) {
    const index = this.leaves.findIndex(leaf => leaf.toString('hex') === hash);
    return index !== -1 ? this.drugs[index] : null;
  }
}

/**
 * Generate sample drug batch data
 */
function generateSampleDrugBatch(count = 10, drugName = "Paracetamol") {
  const drugs = [];
  const baseDate = Date.now();
  
  for (let i = 1; i <= count; i++) {
    drugs.push({
      name: drugName,
      batchNumber: `${drugName.toUpperCase()}-${String(i).padStart(3, '0')}`,
      manufacturer: "PharmaCorp Ltd",
      manufactureDate: new Date(baseDate).toISOString(),
      expiryDate: new Date(baseDate + (365 * 24 * 60 * 60 * 1000)).toISOString(), // 1 year from manufacture
      serialNumber: `SN${Date.now()}${i}`,
      additionalData: JSON.stringify({
        dosage: "500mg",
        form: "tablet",
        storage: "room temperature",
        lot: `LOT-${i}`
      })
    });
  }
  
  return drugs;
}

/**
 * Create WHO approved drug hash
 */
function createWHODrugHash(drugName, approvalYear = 2024) {
  return keccak256(`${drugName}-WHO-${approvalYear}`).toString('hex');
}

/**
 * Verify drug batch integrity
 */
function verifyBatchIntegrity(drugs, merkleRoot) {
  const tree = new DrugMerkleTree(drugs);
  return tree.getRoot() === merkleRoot;
}

/**
 * Export functions for use in other modules
 */
module.exports = {
  DrugMerkleTree,
  generateSampleDrugBatch,
  createWHODrugHash,
  verifyBatchIntegrity
};

// Example usage for testing
if (require.main === module) {
  console.log("=== MedChain Merkle Tree Utility Demo ===\n");

  // Generate sample drug batch
  const drugs = generateSampleDrugBatch(5, "Paracetamol");
  console.log("Generated sample drugs:", drugs);

  // Create Merkle tree
  const drugTree = new DrugMerkleTree(drugs);
  console.log("\nMerkle Root:", drugTree.getRoot());

  // Get proof for first drug
  const proof = drugTree.getProof(drugs[0]);
  console.log("\nProof for first drug:", proof);

  // Verify drug
  const isValid = drugTree.verify(drugs[0], proof);
  console.log("Drug verification result:", isValid);

  // Show WHO approved drug hash
  const whoHash = createWHODrugHash("Paracetamol");
  console.log("\nWHO approved drug hash:", whoHash);
}
