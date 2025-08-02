import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Protected route component for supply chain actors (wallet-based auth)
export const SupplyChainRoute = ({ children }) => {
  const { isSupplyChainActor, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isSupplyChainActor() ? children : <Navigate to="/login" replace />;
};

// Protected route component for authenticated users (any auth type)
export const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Role-based route protection
export const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);
  
  useEffect(() => {
    if (!loading && user) {
      // Show loading for 1 second, then show dashboard
      const timer = setTimeout(() => {
        setShowDashboard(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, user]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Show loading screen for 1 second, then show dashboard
  if (!showDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking Access Permissions...</p>
        </div>
      </div>
    );
  }
  
  // Show the actual dashboard
  return children;
};

// Permission-based route protection
export const PermissionBasedRoute = ({ children, requiredPermissions = [] }) => {
  const { user, hasPermission, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const hasAccess = requiredPermissions.every(permission => hasPermission(permission));
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Permissions</h1>
          <p className="text-gray-600 mb-4">
            You don't have the required permissions to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required: {requiredPermissions.join(', ')}
          </p>
        </div>
      </div>
    );
  }
  
  return children;
};

// Public route (accessible to anyone, including unauthenticated users)
export const PublicRoute = ({ children }) => {
  return children;
};

export default {
  SupplyChainRoute,
  AuthenticatedRoute,
  RoleBasedRoute,
  PermissionBasedRoute,
  PublicRoute
};

