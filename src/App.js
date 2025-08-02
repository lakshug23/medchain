import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { ContractProvider } from './contexts/ContractContext';
import { AuthProvider } from './contexts/AuthContext';
import { SupplyChainRoute, AuthenticatedRoute, RoleBasedRoute, PermissionBasedRoute, PublicRoute } from './components/ProtectedRoute';
import { Header } from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import LoginPage from './pages/LoginPage';
import DashboardSelector from './pages/DashboardSelector';
import Home from './pages/Home';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DrugVerification from './pages/DrugVerification';
import HealthRecords from './pages/HealthRecords';
import TestPage from './pages/TestPage';
import DistributorTestPage from './pages/DistributorTestPage';
import TransferTestPage from './pages/TransferTestPage';
import DispenseManagement from './pages/DispenseManagement';
import DispenseTestPage from './pages/DispenseTestPage';
import DemandForecastingPage from './pages/DemandForecastingPage';
import QRTestPage from './pages/QRTestPage';
import SmartRedistributionDashboard from './components/SmartRedistributionDashboard';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-3xl font-display font-bold text-white">MedChain</h2>
          <p className="text-surface-300">Securing pharmaceutical supply chains</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-surface-50 relative">
      <Router>
        <AuthProvider>
          <WalletProvider>
            <ContractProvider>
              <div className="flex flex-col min-h-screen relative z-10">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    
                    {/* Authentication required */}
                    <Route path="/dashboard" element={<AuthenticatedRoute><DashboardSelector /></AuthenticatedRoute>} />
                    
                    {/* Supply chain actor routes (wallet-based auth) */}
                    <Route path="/manufacturer" element={
                      <RoleBasedRoute allowedRoles={['manufacturer', 'admin']}>
                        <ManufacturerDashboard />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/distributor" element={
                      <RoleBasedRoute allowedRoles={['distributor', 'admin']}>
                        <DistributorDashboard />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/hospital" element={
                      <RoleBasedRoute allowedRoles={['hospital', 'admin']}>
                        <HospitalDashboard />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/dispense" element={
                      <PermissionBasedRoute requiredPermissions={['dispense_drug']}>
                        <DispenseManagement />
                      </PermissionBasedRoute>
                    } />
                    
                    <Route path="/admin" element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </RoleBasedRoute>
                    } />
                    
                    {/* Mixed access routes */}
                    <Route path="/verify" element={
                      <RoleBasedRoute allowedRoles={['manufacturer', 'distributor', 'hospital', 'admin', 'public_user', 'guest']}>
                        <DrugVerification />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/verify-drug" element={<Navigate to="/verify" replace />} />
                    <Route path="/verify-drugs" element={<Navigate to="/verify" replace />} />
                    
                    <Route path="/forecasting" element={
                      <RoleBasedRoute allowedRoles={['manufacturer', 'distributor', 'hospital', 'admin']}>
                        <DemandForecastingPage />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/redistribution" element={
                      <RoleBasedRoute allowedRoles={['manufacturer', 'distributor', 'hospital', 'admin']}>
                        <SmartRedistributionDashboard />
                      </RoleBasedRoute>
                    } />
                    
                    {/* Supply chain only routes */}
                    <Route path="/health-records" element={
                      <RoleBasedRoute allowedRoles={['hospital', 'admin']}>
                        <HealthRecords />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/patient" element={
                      <RoleBasedRoute allowedRoles={['patient', 'admin']}>
                        <PatientDashboard />
                      </RoleBasedRoute>
                    } />
                    
                    {/* Test routes (supply chain only) */}
                    <Route path="/test" element={
                      <RoleBasedRoute allowedRoles={['manufacturer', 'distributor', 'hospital', 'admin']}>
                        <TestPage />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/test-distributor" element={
                      <RoleBasedRoute allowedRoles={['distributor', 'admin']}>
                        <DistributorTestPage />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/test-transfer" element={
                      <SupplyChainRoute>
                        <TransferTestPage />
                      </SupplyChainRoute>
                    } />
                    
                    <Route path="/test-dispense" element={
                      <RoleBasedRoute allowedRoles={['hospital', 'admin']}>
                        <DispenseTestPage />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/qr-test" element={
                      <AuthenticatedRoute>
                        <QRTestPage />
                      </AuthenticatedRoute>
                    } />
                    
                    {/* Catch all - redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </ContractProvider>
          </WalletProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
