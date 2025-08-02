import React from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';

const RoleProtection = ({ requiredRole, children, fallback = null }) => {
  const { userRole } = useContract();
  const { account } = useWallet();

  // If not connected, show connection message
  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-4">
            Please connect your wallet to access this feature.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // If role is still loading
  if (userRole === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Checking Access Permissions</h2>
          <p className="text-gray-600">
            Verifying your role on the blockchain...
          </p>
        </div>
      </div>
    );
  }

  // If user doesn't have required role
  if (requiredRole && userRole !== requiredRole) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-6xl mb-4">⛔</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You need <span className="font-semibold text-blue-600">{requiredRole}</span> role to access this page.
          </p>
          <div className="bg-gray-100 rounded-md p-3 mb-4">
            <p className="text-sm text-gray-600">
              Your current role: <span className="font-semibold">{userRole || 'None'}</span>
            </p>
            <p className="text-sm text-gray-600">
              Required role: <span className="font-semibold">{requiredRole}</span>
            </p>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 mr-2"
          >
            Go Back
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  // User has required role, render children
  return children;
};

// Helper component for role-based conditional rendering
export const RoleGate = ({ allowedRoles, children, fallback = null }) => {
  const { userRole } = useContract();
  
  if (!allowedRoles.includes(userRole)) {
    return fallback;
  }
  
  return children;
};

// Helper component for showing role status
export const RoleStatus = ({ className = "" }) => {
  const { userRole } = useContract();
  const { account } = useWallet();

  const getRoleColor = (role) => {
    const colors = {
      MANUFACTURER: 'bg-blue-100 text-blue-800',
      DISTRIBUTOR: 'bg-yellow-100 text-yellow-800',
      HOSPITAL: 'bg-green-100 text-green-800',
      PATIENT: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role) => {
    const icons = {
      MANUFACTURER: '🏭',
      DISTRIBUTOR: '🚚',
      HOSPITAL: '🏥',
      PATIENT: '👤',
      ADMIN: '⚡'
    };
    return icons[role] || '❓';
  };

  if (!account) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        🔐 Not Connected
      </span>
    );
  }

  if (userRole === null) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        ⏳ Checking...
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userRole)} ${className}`}>
      {getRoleIcon(userRole)} {userRole || 'No Role'}
    </span>
  );
};

export default RoleProtection;
