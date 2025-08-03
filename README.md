# MedChain - Pharmaceutical Supply Chain Management

## Overview

MedChain is a blockchain-based pharmaceutical supply chain solution that tracks drugs from manufacturer to patient, ensuring authenticity and transparency through decentralized verification.

## Key Features

- **End-to-End Drug Tracking**: Monitor medications from production to patient
- **Role-Based Access Control**: Secure system for manufacturers, distributors, hospitals, and patients
- **QR Code Verification**: Instant drug authenticity checks
- **Demand Forecasting**: AI-powered analytics for supply chain optimization
- **Smart Redistribution**: Automated inventory balancing between facilities

## System Architecture

### Blockchain Layer

- **Smart Contracts**:
  - Drug Verification (Merkle proof validation)
  - IPFS Storage (Metadata management)
  - Supply Chain Logic (Role-based workflows)

### Frontend Layer

- React.js with TailwindCSS
- Context API for state management
- Role-specific dashboards

## Getting Started

### Prerequisites

- Node.js v16+
- npm v8+
- Local Ethereum node (e.g., Hardhat)

### Installation

```bash
git clone [repository-url]
cd frontend
npm install
```

### Configuration

Create `.env` file with:

```
REACT_APP_CONTRACT_ADDRESS=[your-contract-address]
REACT_APP_NETWORK_URL=http://localhost:8545
```

### Running

```bash
npm start
```

## Usage Examples

### Verify a Drug

```javascript
const isValid = await contract.verifyDrugInBatch(batchHash, drugHash, proof);
```

### Create Drug Batch

```javascript
await contract.createDrugBatch("Medicine", rootHash, ipfsHash, 1000, expiry);
```

## API Reference

[See full API documentation in DOCUMENTATION.md]

## License

MIT
