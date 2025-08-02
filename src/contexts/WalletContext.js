import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState('0');

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  // Update balance when account changes
  useEffect(() => {
    if (account && provider) {
      updateBalance();
    }
  }, [account, provider]);

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setProvider(provider);
          setSigner(signer);
          setAccount(accounts[0].address);
          setNetwork(network);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      const errorMessage = 'MetaMask is not installed. Please install MetaMask to continue.';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      setIsConnecting(true);
      
      // Request account access with improved error handling
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (requestError) {
        // Handle user rejection specifically
        if (requestError.code === 4001) {
          throw new Error('Connection rejected. Please approve the connection request in MetaMask.');
        }
        throw requestError;
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setNetwork(network);
      setIsConnected(true);
      
      console.log('Wallet connected successfully:', address);
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error; // Propagate error to be handled by the UI component
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setNetwork(null);
    setBalance('0');
    console.log('Wallet disconnected');
  };

  const updateBalance = async () => {
    try {
      if (account && provider) {
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    // Reload the page to reset the app state
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  };

  const addNetwork = async (networkConfig) => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });
    } catch (error) {
      console.error('Error adding network:', error);
      throw error;
    }
  };

  const getShortAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const value = {
    account,
    provider,
    signer,
    isConnected,
    isConnecting,
    network,
    balance,
    connectWallet,
    disconnectWallet,
    updateBalance,
    switchNetwork,
    addNetwork,
    getShortAddress
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
