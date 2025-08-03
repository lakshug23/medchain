// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title DrugVerification
 * @dev Standalone contract for drug verification using Merkle proofs
 */
contract DrugVerification {
    
    struct DrugData {
        string name;
        string manufacturer;
        uint256 batchNumber;
        uint256 manufactureDate;
        uint256 expiryDate;
        string additionalData;
    }
    
    mapping(bytes32 => bytes32) public batchMerkleRoots;
    mapping(bytes32 => bool) public verifiedDrugs;
    
    event DrugBatchVerified(
        bytes32 indexed batchHash,
        bytes32 merkleRoot,
        address indexed verifier
    );
    
    event DrugVerificationResult(
        bytes32 indexed drugHash,
        bool isValid,
        address indexed verifier
    );
    
    function setBatchMerkleRoot(
        bytes32 _batchHash,
        bytes32 _merkleRoot
    ) external {
        batchMerkleRoots[_batchHash] = _merkleRoot;
        emit DrugBatchVerified(_batchHash, _merkleRoot, msg.sender);
    }
    
    function verifyDrugInBatch(
        bytes32 _batchHash,
        bytes32 _drugHash,
        bytes32[] memory _proof
    ) external returns (bool) {
        bytes32 root = batchMerkleRoots[_batchHash];
        require(root != bytes32(0), "Batch not found");
        
        bool isValid = MerkleProof.verify(_proof, root, _drugHash);
        
        if (isValid) {
            verifiedDrugs[_drugHash] = true;
        }
        
        emit DrugVerificationResult(_drugHash, isValid, msg.sender);
        return isValid;
    }
    
    function isDrugVerified(bytes32 _drugHash) external view returns (bool) {
        return verifiedDrugs[_drugHash];
    }
    
    function getBatchRoot(bytes32 _batchHash) external view returns (bytes32) {
        return batchMerkleRoots[_batchHash];
    }
    
    // Utility function to generate drug hash from drug data
    function generateDrugHash(DrugData memory _drug) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            _drug.name,
            _drug.manufacturer,
            _drug.batchNumber,
            _drug.manufactureDate,
            _drug.expiryDate,
            _drug.additionalData
        ));
    }
}
