import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardSelector = () => {
  const { user, authType, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardOptions = () => {
    if (authType === 'wallet') {
      switch (user?.role) {
        case 'manufacturer':
          return [
            {
              title: 'Manufacturer Dashboard',
              description: 'Create batches, generate QR codes, manage production',
              path: '/manufacturer',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
              color: 'blue'
            },
            {
              title: 'Drug Verification',
              description: 'Verify and track drug batches',
              path: '/verify',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
              color: 'green'
            },
            {
              title: 'Demand Forecasting',
              description: 'AI-powered demand analytics and forecasting',
              path: '/forecasting',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
              color: 'purple'
            },
            {
              title: 'Smart Redistribution',
              description: 'Automated stockout detection and route optimization',
              path: '/redistribution',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
              color: 'orange'
            }
          ];
        case 'distributor':
          return [
            {
              title: 'Distributor Dashboard',
              description: 'Manage transfers, track inventory, handle logistics',
              path: '/distributor',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
              color: 'orange'
            },
            {
              title: 'Drug Verification',
              description: 'Verify and track drug batches',
              path: '/verify',
              icon: '🔍',
              color: 'green'
            },
            {
              title: 'Demand Forecasting',
              description: 'AI-powered demand analytics and forecasting',
              path: '/forecasting',
              icon: '📊',
              color: 'purple'
            },
            {
              title: 'Smart Redistribution',
              description: 'Automated stockout detection and route optimization',
              path: '/redistribution',
              icon: '🚚',
              color: 'orange'
            }
          ];
        case 'hospital':
          return [
            {
              title: 'Hospital Dashboard',
              description: 'Dispense drugs, manage patients, track usage',
              path: '/hospital',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
              color: 'red'
            },
            {
              title: 'Drug Verification',
              description: 'Verify and track drug batches',
              path: '/verify',
              icon: '🔍',
              color: 'green'
            },
            {
              title: 'Demand Forecasting',
              description: 'View demand forecasts and analytics',
              path: '/forecasting',
              icon: '📊',
              color: 'purple'
            },
            {
              title: 'Smart Redistribution',
              description: 'View redistribution routes and network status',
              path: '/redistribution',
              icon: '🚚',
              color: 'orange'
            }
          ];
        case 'admin':
          return [
            {
              title: 'Admin Dashboard',
              description: 'System administration and management',
              path: '/admin',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
              color: 'purple'
            },
            {
              title: 'Manufacturer Dashboard',
              description: 'Create batches, generate QR codes, manage production',
              path: '/manufacturer',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
              color: 'blue'
            },
            {
              title: 'Distributor Dashboard',
              description: 'Manage transfers, track inventory, handle logistics',
              path: '/distributor',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
              color: 'orange'
            },
            {
              title: 'Hospital Dashboard',
              description: 'Dispense drugs, manage patients, track usage',
              path: '/hospital',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
              color: 'red'
            },
            {
              title: 'Patient Dashboard',
              description: 'Patient management and services',
              path: '/patient',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
              color: 'green'
            },
            {
              title: 'Drug Verification',
              description: 'Verify and track drug batches',
              path: '/verify',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
              color: 'green'
            },
            {
              title: 'Demand Forecasting',
              description: 'AI-powered demand analytics and forecasting',
              path: '/forecasting',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
              color: 'purple'
            },
            {
              title: 'Smart Redistribution',
              description: 'Automated stockout detection and route optimization',
              path: '/redistribution',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
              color: 'orange'
            },
            {
              title: 'Health Records',
              description: 'Manage patient health records and data',
              path: '/health-records',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
              color: 'blue'
            }
          ];
        default:
          return [];
      }
    } else {
      // Public users (email/guest) only get verification access
      return [
        {
          title: 'Drug Verification',
          description: 'Scan QR codes and verify drug authenticity',
          path: '/verify',
          icon: '🔍',
          color: 'green'
        }
      ];
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-800',
      green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-800',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-800',
      red: 'bg-red-50 border-red-200 hover:bg-red-100 text-red-800'
    };
    return colors[color] || colors.blue;
  };

  const dashboardOptions = getDashboardOptions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            <svg className="w-24 h-24 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MedChain Dashboard</h1>
          <p className="text-gray-600 mb-4">Welcome back!</p>
          
          {/* User Info */}
          <div className="bg-white rounded-lg shadow-sm border p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="font-medium text-gray-900">{user?.name || user?.email}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {authType === 'wallet' ? `${user?.role} (Wallet)` : `${user?.role} (${authType})`}
                </p>
                {authType === 'wallet' && (
                  <p className="text-xs text-gray-400 font-mono">
                    {user?.address?.slice(0, 6)}...{user?.address?.slice(-4)}
                  </p>
                )}
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Options */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboardOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => navigate(option.path)}
              className={`
                cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 transform hover:scale-105
                ${getColorClasses(option.color)}
              `}
            >
              <div className="text-center">
                <div className="mb-3 flex justify-center">{option.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
                <p className="text-sm opacity-80">{option.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info for Supply Chain Users */}
        {authType === 'wallet' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Permissions</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {user?.permissions?.map((permission, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="capitalize">{permission.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions for Public Users */}
        {authType !== 'wallet' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What you can do</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                <span>Scan QR codes to verify drug authenticity</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                <span>View basic supply chain information</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                <span>Check expiration dates and batch details</span>
              </div>
              {authType === 'guest' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Create an account with email for enhanced features and tracking history.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSelector;
