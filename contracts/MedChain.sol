// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MedChain
 * @dev Decentralized Drug Supply Chain & Health Record Management System
 */
contract MedChain is AccessControl, ReentrancyGuard {
    
    // Role definitions
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Enums
    enum DrugStatus { 
        Manufactured, 
        WithDistributor, 
        WithHospital, 
        DispensedToPatient, 
        Expired 
    }
    
    enum HospitalType { Urban, Rural }
    enum RequestStatus { Pending, Approved, Rejected, Fulfilled }

    // Structs
    struct DrugBatch {
        uint256 batchId;
        string drugName;
        address manufacturer;
        bytes32 merkleRoot;
        string ipfsHash;
        uint256 quantity;
        uint256 manufactureDate;
        uint256 expiryDate;
        DrugStatus status;
        address currentHolder;
    }

    struct Hospital {
        address hospitalAddress;
        string name;
        HospitalType hospitalType;
        uint256 stockCount;
        uint256 stockThreshold;
        bool isActive;
    }

    struct DrugRequest {
        uint256 requestId;
        address hospital;
        address distributor;
        uint256 batchId;
        uint256 quantity;
        RequestStatus status;
        uint256 timestamp;
        string reason;
    }

    struct HealthRecord {
        address patient;
        string ipfsHash;
        uint256 lastUpdated;
        bool exists;
    }

    struct ExpiredDrugReport {
        uint256 reportId;
        uint256 batchId;
        address reporter;
        string ipfsHash;
        uint256 timestamp;
        bool verified;
    }

    // State variables
    uint256 private nextBatchId = 1;
    uint256 private nextRequestId = 1;
    uint256 private nextReportId = 1;
    
    // Rural to Urban priority ratio (2:1)
    uint256 public constant RURAL_PRIORITY_MULTIPLIER = 2;

    // Mappings
    mapping(uint256 => DrugBatch) public drugBatches;
    mapping(address => Hospital) public hospitals;
    mapping(uint256 => DrugRequest) public drugRequests;
    mapping(address => HealthRecord) public healthRecords;
    mapping(uint256 => ExpiredDrugReport) public expiredReports;
    mapping(bytes32 => bool) public whoApprovedDrugs;
    mapping(address => uint256[]) public hospitalRequests;
    mapping(address => uint256[]) public patientBatches;

    // Events
    event DrugBatchCreated(
        uint256 indexed batchId,
        string drugName,
        address indexed manufacturer,
        bytes32 merkleRoot,
        uint256 quantity
    );
    
    event DrugTransferred(
        uint256 indexed batchId,
        address indexed from,
        address indexed to,
        DrugStatus newStatus
    );
    
    event DrugVerified(
        uint256 indexed batchId,
        address indexed verifier,
        bool isValid
    );
    
    event HospitalRegistered(
        address indexed hospital,
        string name,
        HospitalType hospitalType
    );
    
    event DrugRequested(
        uint256 indexed requestId,
        address indexed hospital,
        address indexed distributor,
        uint256 quantity
    );
    
    event StockThresholdReached(
        address indexed hospital,
        uint256 currentStock,
        uint256 threshold
    );
    
    event HealthRecordUpdated(
        address indexed patient,
        string ipfsHash,
        uint256 timestamp
    );
    
    event ExpiredDrugReported(
        uint256 indexed reportId,
        uint256 indexed batchId,
        address indexed reporter
    );

    // Modifiers
    modifier onlyManufacturer() {
        require(hasRole(MANUFACTURER_ROLE, msg.sender), "Only manufacturer can call this function");
        _;
    }
    
    modifier onlyDistributor() {
        require(hasRole(DISTRIBUTOR_ROLE, msg.sender), "Only distributor can call this function");
        _;
    }
    
    modifier onlyHospital() {
        require(hasRole(HOSPITAL_ROLE, msg.sender), "Only hospital can call this function");
        _;
    }
    
    modifier onlyPatient() {
        require(hasRole(PATIENT_ROLE, msg.sender), "Only patient can call this function");
        _;
    }
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin can call this function");
        _;
    }

    modifier validBatch(uint256 _batchId) {
        require(_batchId > 0 && _batchId < nextBatchId, "Invalid batch ID");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // Role Management Functions
    function grantManufacturerRole(address account) external onlyAdmin {
        _grantRole(MANUFACTURER_ROLE, account);
    }
    
    function grantDistributorRole(address account) external onlyAdmin {
        _grantRole(DISTRIBUTOR_ROLE, account);
    }
    
    function grantHospitalRole(address account) external onlyAdmin {
        _grantRole(HOSPITAL_ROLE, account);
    }
    
    function grantPatientRole(address account) external onlyAdmin {
        _grantRole(PATIENT_ROLE, account);
    }

    // Drug Lifecycle Functions
    function createDrugBatch(
        string memory _drugName,
        bytes32 _merkleRoot,
        string memory _ipfsHash,
        uint256 _quantity,
        uint256 _expiryDate
    ) external onlyManufacturer returns (uint256) {
        require(_quantity > 0, "Quantity must be greater than 0");
        require(_expiryDate > block.timestamp, "Expiry date must be in the future");
        require(bytes(_drugName).length > 0, "Drug name cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        uint256 batchId = nextBatchId++;
        
        drugBatches[batchId] = DrugBatch({
            batchId: batchId,
            drugName: _drugName,
            manufacturer: msg.sender,
            merkleRoot: _merkleRoot,
            ipfsHash: _ipfsHash,
            quantity: _quantity,
            manufactureDate: block.timestamp,
            expiryDate: _expiryDate,
            status: DrugStatus.Manufactured,
            currentHolder: msg.sender
        });
        
        emit DrugBatchCreated(batchId, _drugName, msg.sender, _merkleRoot, _quantity);
        return batchId;
    }

    function transferToDistributor(
        uint256 _batchId,
        address _distributor
    ) external onlyManufacturer validBatch(_batchId) {
        require(hasRole(DISTRIBUTOR_ROLE, _distributor), "Invalid distributor address");
        require(drugBatches[_batchId].manufacturer == msg.sender, "Only batch manufacturer can transfer");
        require(drugBatches[_batchId].status == DrugStatus.Manufactured, "Invalid batch status");
        
        drugBatches[_batchId].status = DrugStatus.WithDistributor;
        drugBatches[_batchId].currentHolder = _distributor;
        
        emit DrugTransferred(_batchId, msg.sender, _distributor, DrugStatus.WithDistributor);
    }

    function transferToHospital(
        uint256 _batchId,
        address _hospital
    ) external onlyDistributor validBatch(_batchId) {
        require(hasRole(HOSPITAL_ROLE, _hospital), "Invalid hospital address");
        require(drugBatches[_batchId].currentHolder == msg.sender, "Only current holder can transfer");
        require(drugBatches[_batchId].status == DrugStatus.WithDistributor, "Invalid batch status");
        require(hospitals[_hospital].isActive, "Hospital is not active");
        
        drugBatches[_batchId].status = DrugStatus.WithHospital;
        drugBatches[_batchId].currentHolder = _hospital;
        
        // Update hospital stock
        hospitals[_hospital].stockCount += drugBatches[_batchId].quantity;
        
        emit DrugTransferred(_batchId, msg.sender, _hospital, DrugStatus.WithHospital);
    }

    function dispenseToPatient(
        uint256 _batchId,
        address _patient,
        uint256 _quantity
    ) external onlyHospital validBatch(_batchId) {
        require(hasRole(PATIENT_ROLE, _patient), "Invalid patient address");
        require(drugBatches[_batchId].currentHolder == msg.sender, "Only current holder can dispense");
        require(drugBatches[_batchId].status == DrugStatus.WithHospital, "Invalid batch status");
        require(_quantity <= drugBatches[_batchId].quantity, "Insufficient quantity");
        
        drugBatches[_batchId].quantity -= _quantity;
        
        if (drugBatches[_batchId].quantity == 0) {
            drugBatches[_batchId].status = DrugStatus.DispensedToPatient;
        }
        
        // Update hospital stock
        hospitals[msg.sender].stockCount -= _quantity;
        
        // Add to patient's batch history
        patientBatches[_patient].push(_batchId);
        
        // Check stock threshold
        Hospital memory hospital = hospitals[msg.sender];
        if (hospital.stockCount <= hospital.stockThreshold) {
            emit StockThresholdReached(msg.sender, hospital.stockCount, hospital.stockThreshold);
        }
        
        emit DrugTransferred(_batchId, msg.sender, _patient, DrugStatus.DispensedToPatient);
    }

    // Drug Verification Functions
    function verifyDrug(
        uint256 _batchId,
        bytes32 _leaf,
        bytes32[] memory _proof
    ) public view validBatch(_batchId) returns (bool) {
        bytes32 root = drugBatches[_batchId].merkleRoot;
        return MerkleProof.verify(_proof, root, _leaf);
    }

    function verifyAndLog(
        uint256 _batchId,
        bytes32 _leaf,
        bytes32[] memory _proof
    ) external validBatch(_batchId) returns (bool) {
        bool isValid = verifyDrug(_batchId, _leaf, _proof);
        emit DrugVerified(_batchId, msg.sender, isValid);
        return isValid;
    }

    // Hospital Management Functions
    function registerHospital(
        address _hospital,
        string memory _name,
        HospitalType _hospitalType,
        uint256 _stockThreshold
    ) external onlyAdmin {
        require(!hospitals[_hospital].isActive, "Hospital already registered");
        require(bytes(_name).length > 0, "Hospital name cannot be empty");
        
        hospitals[_hospital] = Hospital({
            hospitalAddress: _hospital,
            name: _name,
            hospitalType: _hospitalType,
            stockCount: 0,
            stockThreshold: _stockThreshold,
            isActive: true
        });
        
        _grantRole(HOSPITAL_ROLE, _hospital);
        emit HospitalRegistered(_hospital, _name, _hospitalType);
    }

    // Drug Request Functions
    function requestDrugs(
        address _distributor,
        uint256 _batchId,
        uint256 _quantity,
        string memory _reason
    ) external onlyHospital returns (uint256) {
        require(hasRole(DISTRIBUTOR_ROLE, _distributor), "Invalid distributor address");
        require(hospitals[msg.sender].isActive, "Hospital is not active");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(bytes(_reason).length > 0, "Reason cannot be empty");
        
        uint256 requestId = nextRequestId++;
        
        drugRequests[requestId] = DrugRequest({
            requestId: requestId,
            hospital: msg.sender,
            distributor: _distributor,
            batchId: _batchId,
            quantity: _quantity,
            status: RequestStatus.Pending,
            timestamp: block.timestamp,
            reason: _reason
        });
        
        hospitalRequests[msg.sender].push(requestId);
        
        emit DrugRequested(requestId, msg.sender, _distributor, _quantity);
        return requestId;
    }

    function approveRequest(uint256 _requestId) external onlyDistributor {
        require(_requestId > 0 && _requestId < nextRequestId, "Invalid request ID");
        require(drugRequests[_requestId].distributor == msg.sender, "Only assigned distributor can approve");
        require(drugRequests[_requestId].status == RequestStatus.Pending, "Request already processed");
        
        drugRequests[_requestId].status = RequestStatus.Approved;
    }

    function rejectRequest(uint256 _requestId) external onlyDistributor {
        require(_requestId > 0 && _requestId < nextRequestId, "Invalid request ID");
        require(drugRequests[_requestId].distributor == msg.sender, "Only assigned distributor can reject");
        require(drugRequests[_requestId].status == RequestStatus.Pending, "Request already processed");
        
        drugRequests[_requestId].status = RequestStatus.Rejected;
    }

    // WHO Approved Drugs Functions
    function addWHOApprovedDrug(bytes32 _drugHash) external onlyAdmin {
        whoApprovedDrugs[_drugHash] = true;
    }

    function removeWHOApprovedDrug(bytes32 _drugHash) external onlyAdmin {
        whoApprovedDrugs[_drugHash] = false;
    }

    function isWHOApproved(bytes32 _drugHash) external view returns (bool) {
        return whoApprovedDrugs[_drugHash];
    }

    // Expired Drug Reporting Functions
    function reportExpiredDrug(
        uint256 _batchId,
        string memory _evidenceIpfsHash
    ) external onlyHospital validBatch(_batchId) returns (uint256) {
        require(drugBatches[_batchId].currentHolder == msg.sender, "Only current holder can report");
        require(bytes(_evidenceIpfsHash).length > 0, "Evidence IPFS hash cannot be empty");
        
        uint256 reportId = nextReportId++;
        
        expiredReports[reportId] = ExpiredDrugReport({
            reportId: reportId,
            batchId: _batchId,
            reporter: msg.sender,
            ipfsHash: _evidenceIpfsHash,
            timestamp: block.timestamp,
            verified: false
        });
        
        // Mark drug as expired
        drugBatches[_batchId].status = DrugStatus.Expired;
        
        emit ExpiredDrugReported(reportId, _batchId, msg.sender);
        return reportId;
    }

    function verifyExpiredReport(uint256 _reportId) external onlyAdmin {
        require(_reportId > 0 && _reportId < nextReportId, "Invalid report ID");
        expiredReports[_reportId].verified = true;
    }

    // Health Record Functions
    function updateHealthRecord(
        address _patient,
        string memory _ipfsHash
    ) external onlyHospital {
        require(hasRole(PATIENT_ROLE, _patient), "Invalid patient address");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        healthRecords[_patient] = HealthRecord({
            patient: _patient,
            ipfsHash: _ipfsHash,
            lastUpdated: block.timestamp,
            exists: true
        });
        
        emit HealthRecordUpdated(_patient, _ipfsHash, block.timestamp);
    }

    function getHealthRecord(address _patient) external view returns (string memory) {
        require(
            msg.sender == _patient || 
            hasRole(HOSPITAL_ROLE, msg.sender) || 
            hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized access to health record"
        );
        require(healthRecords[_patient].exists, "Health record does not exist");
        
        return healthRecords[_patient].ipfsHash;
    }

    // Stock Management Functions
    function updateStockThreshold(
        address _hospital,
        uint256 _newThreshold
    ) external onlyAdmin {
        require(hospitals[_hospital].isActive, "Hospital is not active");
        hospitals[_hospital].stockThreshold = _newThreshold;
    }

    function emergencyStockOverride(
        address _hospital,
        uint256 _newStock
    ) external onlyAdmin {
        require(hospitals[_hospital].isActive, "Hospital is not active");
        hospitals[_hospital].stockCount = _newStock;
    }

    // View Functions
    function getDrugBatch(uint256 _batchId) external view validBatch(_batchId) returns (DrugBatch memory) {
        return drugBatches[_batchId];
    }

    function getHospital(address _hospital) external view returns (Hospital memory) {
        return hospitals[_hospital];
    }

    function getDrugRequest(uint256 _requestId) external view returns (DrugRequest memory) {
        require(_requestId > 0 && _requestId < nextRequestId, "Invalid request ID");
        return drugRequests[_requestId];
    }

    function getExpiredReport(uint256 _reportId) external view returns (ExpiredDrugReport memory) {
        require(_reportId > 0 && _reportId < nextReportId, "Invalid report ID");
        return expiredReports[_reportId];
    }

    function getHospitalRequests(address _hospital) external view returns (uint256[] memory) {
        return hospitalRequests[_hospital];
    }

    function getPatientBatches(address _patient) external view returns (uint256[] memory) {
        return patientBatches[_patient];
    }

    function getCurrentBatchId() external view returns (uint256) {
        return nextBatchId - 1;
    }

    function getCurrentRequestId() external view returns (uint256) {
        return nextRequestId - 1;
    }

    function getCurrentReportId() external view returns (uint256) {
        return nextReportId - 1;
    }

    // Priority logic for rural vs urban hospitals
    function calculatePriority(address _hospital) external view returns (uint256) {
        Hospital memory hospital = hospitals[_hospital];
        if (hospital.hospitalType == HospitalType.Rural) {
            return hospital.stockThreshold * RURAL_PRIORITY_MULTIPLIER;
        }
        return hospital.stockThreshold;
    }
}
