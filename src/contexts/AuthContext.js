import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authType, setAuthType] = useState(null); // 'wallet' | 'email' | 'guest'
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);

  // User roles for wallet-based authentication
  const ROLES = {
    MANUFACTURER: 'manufacturer',
    DISTRIBUTOR: 'distributor',
    HOSPITAL: 'hospital',
    PATIENT: 'patient',
    ADMIN: 'admin'
  };

  // Predefined wallet addresses for demo (in production, this would be from a database)
  const authorizedWallets = {
    // Admin/Developer - Account #0
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266': { 
      role: ROLES.ADMIN, 
      name: 'System Administrator',
      permissions: ['manage_users', 'view_all_data', 'system_config', 'create_batch', 'transfer_batch', 'dispense_drug', 'verify_batch', 'ai_forecasting']
    },
    // Manufacturer - Account #1
    '0x70997970c51812dc3a010c7d01b50e0d17dc79c8': { 
      role: ROLES.MANUFACTURER, 
      name: 'PharmaCorp Manufacturing',
      permissions: ['create_batch', 'generate_qr', 'ai_forecasting']
    },
    // Distributor - Account #2
    '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc': { 
      role: ROLES.DISTRIBUTOR, 
      name: 'Global Distribution Network',
      permissions: ['transfer_batch', 'track_inventory', 'ai_forecasting']
    },
    // Hospital - Account #3
    '0x90f79bf6eb2c4f870365e785982e1f101e93b906': { 
      role: ROLES.HOSPITAL, 
      name: 'City General Hospital',
      permissions: ['dispense_drug', 'verify_batch', 'patient_management', 'ai_forecasting', 'health_records']
    },
    // Patient - Account #4
    '0x15d34aaf54267db7d7c367839aa71a002c6a65': { 
      role: ROLES.PATIENT, 
      name: 'Patient Services',
      permissions: ['ai_forecasting']
    }
  };

  useEffect(() => {
    initializeAuth();
    
    // Listen for wallet account changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for existing session
      const savedAuth = localStorage.getItem('medchain_auth');
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        setUser(authData.user);
        setAuthType(authData.type);
        
        // If wallet auth, verify wallet is still connected
        if (authData.type === 'wallet') {
          await checkWalletConnection();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const isConnected = accounts.length > 0;
        setWalletConnected(isConnected);
        
        // If wallet is connected but user is not authenticated, try to authenticate
        if (isConnected && !user) {
          const walletAddress = accounts[0].toLowerCase();
          const userInfo = authorizedWallets[walletAddress];
          if (userInfo) {
            const provider = new BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            
            const userData = {
              address: walletAddress,
              role: userInfo.role,
              name: userInfo.name,
              permissions: userInfo.permissions,
              network: network.name,
              chainId: Number(network.chainId)
            };

            setUser(userData);
            setAuthType('wallet');
            setWalletConnected(true);

            // Save to localStorage
            localStorage.setItem('medchain_auth', JSON.stringify({
              user: userData,
              type: 'wallet'
            }));
          }
        }
        
        return isConnected;
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        setWalletConnected(false);
        return false;
      }
    }
    return false;
  };

  // Wallet-based authentication for supply chain actors
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      const walletAddress = accounts[0].toLowerCase();
      console.log('Connected wallet:', walletAddress);

      // Check if wallet is authorized
      let userInfo = authorizedWallets[walletAddress];
      
      // If not in authorized list, provide helpful error with available addresses
      if (!userInfo) {
        console.log('Available test addresses:');
        Object.keys(authorizedWallets).forEach((addr, index) => {
          const info = authorizedWallets[addr];
          console.log(`${index + 1}. ${addr} (${info.role} - ${info.name})`);
        });
        
        const error = new Error(`Wallet ${walletAddress} not authorized for supply chain access. Please use one of the authorized test accounts.`);
        error.walletAddress = walletAddress;
        throw error;
      }

      // Get network info
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      const userData = {
        address: walletAddress,
        role: userInfo.role,
        name: userInfo.name,
        permissions: userInfo.permissions,
        network: network.name,
        chainId: Number(network.chainId)
      };

      setUser(userData);
      setAuthType('wallet');
      setWalletConnected(true);

      // Save to localStorage
      localStorage.setItem('medchain_auth', JSON.stringify({
        user: userData,
        type: 'wallet'
      }));

      return userData;
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  };

  // Email-based authentication for public users
  const loginWithEmail = async (email, password) => {
    try {
      // Simulate email authentication (in production, this would call your backend)
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Simple validation for demo
      if (password && password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const userData = {
        email: email,
        role: 'public_user',
        name: email.split('@')[0],
        permissions: ['verify_drug', 'view_public_data'],
        verified: password ? true : false // If password provided, consider verified
      };

      setUser(userData);
      setAuthType('email');

      // Save to localStorage
      localStorage.setItem('medchain_auth', JSON.stringify({
        user: userData,
        type: 'email'
      }));

      return userData;
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  };

  // Guest access for quick verification
  const continueAsGuest = () => {
    const userData = {
      role: 'guest',
      name: 'Guest User',
      permissions: ['verify_drug'],
      sessionId: Date.now().toString()
    };

    setUser(userData);
    setAuthType('guest');

    // Save to localStorage (session only)
    localStorage.setItem('medchain_auth', JSON.stringify({
      user: userData,
      type: 'guest'
    }));

    return userData;
  };

  // Wallet event handlers
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      logout();
    } else {
      // User switched accounts
      const walletAddress = accounts[0].toLowerCase();
      const userInfo = authorizedWallets[walletAddress];
      
      if (userInfo) {
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        
        const userData = {
          address: walletAddress,
          role: userInfo.role,
          name: userInfo.name,
          permissions: userInfo.permissions,
          network: network.name,
          chainId: Number(network.chainId)
        };

        setUser(userData);
        setAuthType('wallet');
        setWalletConnected(true);

        localStorage.setItem('medchain_auth', JSON.stringify({
          user: userData,
          type: 'wallet'
        }));
      } else {
        // New account not authorized
        logout();
      }
    }
  };

  const handleChainChanged = () => {
    // Reload the page to reset the app state
    window.location.reload();
  };

  const handleDisconnect = () => {
    logout();
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setAuthType(null);
    setWalletConnected(false);
    localStorage.removeItem('medchain_auth');
  };

  // Permission checking
  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  // Role checking
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  // Check if user is supply chain actor (wallet-based)
  const isSupplyChainActor = () => {
    return authType === 'wallet' && user?.role && Object.values(ROLES).includes(user.role);
  };

  // Check if user is public (email or guest)
  const isPublicUser = () => {
    return authType === 'email' || authType === 'guest';
  };

  const value = {
    // State
    user,
    authType,
    loading,
    walletConnected,
    
    // Methods
    connectWallet,
    loginWithEmail,
    continueAsGuest,
    logout,
    
    // Utilities
    hasPermission,
    hasRole,
    isAuthenticated,
    isSupplyChainActor,
    isPublicUser,
    checkWalletConnection,
    
    // Constants
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
