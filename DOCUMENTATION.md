# MedChain Documentation

## System Architecture

### Blockchain Layer

- **Smart Contracts**:

  - `DrugVerification.sol`: Handles drug verification using Merkle proofs
  - `IPFSStorage.sol`: Manages IPFS hashes for drug metadata
  - `MedChain.sol`: Main supply chain logic with role-based access control

- **Roles**:
  - Manufacturer: Creates drug batches
  - Distributor: Manages inventory distribution
  - Hospital: Dispenses drugs to patients
  - Patient: Receives medications
  - Admin: Manages system settings

### Frontend Layer

- **Framework**: React.js with React Router
- **State Management**: Context API for wallet, contracts and auth
- **UI Components**:
  - Role-specific dashboards
  - Drug verification interface
  - Demand forecasting tools
  - QR code scanning/generation

### Data Flow

1. Manufacturers create drug batches on-chain
2. Distributors receive and transfer batches
3. Hospitals request and dispense medications
4. Patients verify drug authenticity via QR codes
5. All transactions recorded on blockchain

## Dependencies

### Frontend

- **Core**: React 18, React DOM 18, React Router 6
- **Blockchain**: Ethers.js 6.8, MerkleTreeJS, Keccak256
- **UI**: TailwindCSS 3.2, Lucide React, Recharts
- **Utilities**: Axios, HTML5 QR Code, QRCode generator

### Development

- Testing: React Testing Library, Jest DOM
- Build: React Scripts 5.0
- Linting: ESLint React config

## Setup Instructions

### Prerequisites

- Node.js v16+
- npm v8+
- Local Ethereum node (e.g., Hardhat)

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
```

2. Install dependencies:

```bash
cd frontend
npm install
```

3. Configure environment:

- Create `.env` file with:
  - REACT_APP_CONTRACT_ADDRESS=[your-contract-address]
  - REACT_APP_NETWORK_URL=http://localhost:8545

4. Start development server:

```bash
npm start
```

## API Reference

### Smart Contract Methods

#### DrugVerification.sol

- `verifyDrugInBatch(bytes32 batchHash, bytes32 drugHash, bytes32[] proof)` - Verify drug authenticity
- `setBatchMerkleRoot(bytes32 batchHash, bytes32 merkleRoot)` - Set root for batch verification
- `isDrugVerified(bytes32 drugHash)` - Check verification status

#### MedChain.sol

- `createDrugBatch(string drugName, bytes32 merkleRoot, string ipfsHash, uint256 quantity, uint256 expiryDate)` - Create new drug batch
- `transferToDistributor(uint256 batchId, address distributor)` - Transfer batch to distributor
- `requestDrugs(address distributor, uint256 batchId, uint256 quantity, string reason)` - Request drugs from distributor

### Frontend API

- `/api/forecast` - POST - Submit forecasting parameters
- `/api/verify` - POST - Verify drug QR code
- `/api/health-records` - GET - Fetch patient health records

## Usage Examples

### Verifying a Drug

```javascript
const proof = [...]; // Merkle proof from QR code
const isValid = await contract.verifyDrugInBatch(batchHash, drugHash, proof);
```

### Creating a Drug Batch

```javascript
const tx = await contract.createDrugBatch(
  "Paracetamol",
  merkleRoot,
  ipfsHash,
  1000,
  Math.floor(Date.now() / 1000) + 31536000 // 1 year expiry
);
```

### Requesting Drugs

```javascript
const requestId = await contract.requestDrugs(
  distributorAddress,
  batchId,
  100,
  "Low stock alert"
);
```
