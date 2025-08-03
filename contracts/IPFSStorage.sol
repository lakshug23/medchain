// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPFSStorage
 * @dev Utility contract for managing IPFS hashes and metadata
 */
contract IPFSStorage {
    
    struct IPFSData {
        string hash;
        uint256 timestamp;
        address uploader;
        string metadata;
        bool exists;
    }
    
    mapping(bytes32 => IPFSData) public ipfsData;
    mapping(address => bytes32[]) public userUploads;
    
    event IPFSHashStored(
        bytes32 indexed key,
        string ipfsHash,
        address indexed uploader,
        uint256 timestamp
    );
    
    function storeIPFSHash(
        bytes32 _key,
        string memory _ipfsHash,
        string memory _metadata
    ) external {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!ipfsData[_key].exists, "Key already exists");
        
        ipfsData[_key] = IPFSData({
            hash: _ipfsHash,
            timestamp: block.timestamp,
            uploader: msg.sender,
            metadata: _metadata,
            exists: true
        });
        
        userUploads[msg.sender].push(_key);
        
        emit IPFSHashStored(_key, _ipfsHash, msg.sender, block.timestamp);
    }
    
    function getIPFSHash(bytes32 _key) external view returns (string memory) {
        require(ipfsData[_key].exists, "IPFS data does not exist");
        return ipfsData[_key].hash;
    }
    
    function getIPFSData(bytes32 _key) external view returns (IPFSData memory) {
        require(ipfsData[_key].exists, "IPFS data does not exist");
        return ipfsData[_key];
    }
    
    function getUserUploads(address _user) external view returns (bytes32[] memory) {
        return userUploads[_user];
    }
}
