import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { useAuth } from '../contexts/AuthContext';
import ParticlesBackground from '../components/ParticlesBackground';
import Carousel3D from '../components/Carousel3D';
import InteractiveGradient from '../components/InteractiveGradient';
import ShinyText from '../components/ShinyText';
import GradientButton from '../components/GradientButton';
import ReflectBackground from '../components/ReflectBackground';
import ErrorPopup from '../components/ErrorPopup';

const Home = () => {
  const { isConnected, connectWallet } = useWallet();
  const { userRole } = useContract();
  const { isAuthenticated, user, authType } = useAuth();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setErrorMessage(error.message || 'Failed to connect MetaMask. Please make sure MetaMask is installed and unlocked.');
      setShowError(true);
    }
  };

  const handleReconnect = async () => {
    setShowError(false);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to reconnect wallet:', error);
      setErrorMessage(error.message || 'Failed to connect MetaMask. Please make sure MetaMask is installed and unlocked.');
      setShowError(true);
    }
  };

  const features = [
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
      title: 'Blockchain Tracking',
      description: 'Every drug movement is recorded immutably on the blockchain for complete transparency.'
    },
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
      title: 'Drug Verification',
      description: 'Verify drug authenticity using Merkle proofs and cryptographic signatures.'
    },
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      title: 'Hospital Management',
      description: 'Streamlined inventory management with smart threshold monitoring.'
    },
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      title: 'Health Records',
      description: 'Secure, patient-controlled health records stored on IPFS.'
    },
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      title: 'WHO Integration',
      description: 'Integration with WHO approved drug databases for compliance.'
    },
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      title: 'Real-time Updates',
      description: 'Instant notifications for critical events and threshold alerts.'
    }
  ];

  const stats = [
    { 
      label: 'Drug Batches Tracked', 
      value: '10,000+', 
      icon: <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
    },
    { 
      label: 'Hospitals Connected', 
      value: '500+', 
      icon: <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    },
    { 
      label: 'Patients Served', 
      value: '1M+', 
      icon: <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    },
    { 
      label: 'Verifications Made', 
      value: '50K+', 
      icon: <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
  ];

  const roleCards = [
    {
      role: 'MANUFACTURER',
      title: 'Pharmaceutical Manufacturer',
      description: 'Create drug batches, manage production, and track distribution.',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      path: '/manufacturer',
      color: 'from-blue-500 to-blue-600'
    },
    {
      role: 'DISTRIBUTOR',
      title: 'Drug Distributor',
      description: 'Manage inventory, approve requests, and coordinate deliveries.',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
      path: '/distributor',
      color: 'from-green-500 to-green-600'
    },
    {
      role: 'HOSPITAL',
      title: 'Healthcare Provider',
      description: 'Verify drugs, manage stock, and dispense to patients.',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      path: '/hospital',
      color: 'from-purple-500 to-purple-600'
    },
    {
      role: 'PATIENT',
      title: 'Patient',
      description: 'Access health records and view medication history.',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      path: '/patient',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const carouselItems = [
    {
      id: 1,
      title: 'Pharmaceutical Manufacturer',
      brand: 'MANUFACTURER',
      description: 'Create drug batches, manage production, and track distribution across the supply chain. Monitor batch quality and compliance with regulatory standards.',
      tags: ['Production', 'Quality Control', 'Distribution', 'Compliance'],
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM2I4MmY2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxZDRlZDg7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQxKSIgLz4KPC9zdmc+',
      link: '/manufacturer',
      color: '#1e40af'
    },
    {
      id: 2,
      title: 'Drug Distributor',
      brand: 'DISTRIBUTOR',
      description: 'Manage inventory, approve requests, and coordinate deliveries to healthcare providers. Optimize logistics and maintain supply chain efficiency.',
      tags: ['Inventory', 'Logistics', 'Approvals', 'Delivery'],
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDIiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMTBhOTUxO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNTk2Njk7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQyKSIgLz4KPC9zdmc+',
      link: '/distributor',
      color: '#059669'
    },
    {
      id: 3,
      title: 'Healthcare Provider',
      brand: 'HOSPITAL',
      description: 'Verify drugs, manage stock, and dispense to patients. Access real-time inventory and patient medication history.',
      tags: ['Verification', 'Dispensing', 'Inventory', 'Patient Care'],
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDMiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOGI1Y2Y2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM3YzNhZWQ7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQzKSIgLz4KPC9zdmc+',
      link: '/hospital',
      color: '#7c3aed'
    },
    {
      id: 4,
      title: 'Patient Portal',
      brand: 'PATIENT',
      description: 'Access personal health records and view medication history. Track prescriptions and maintain health information.',
      tags: ['Health Records', 'Medications', 'History', 'Personal'],
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmY5NzAwO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNjU0MDA7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQ0KSIgLz4KPC9zdmc+',
      link: '/patient',
      color: '#ea580c'
    },
    {
      id: 5,
      title: 'Developer Dashboard',
      brand: 'DEVELOPER',
      description: 'Access smart contract management, deployment tools, and blockchain analytics. Monitor system performance and debug issues.',
      tags: ['Smart Contracts', 'Deployment', 'Analytics', 'Debugging'],
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDUiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2NmYxO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0ZjQ2ZTU7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQ1KSIgLz4KPC9zdmc+',
      link: '/developer',
      color: '#4f46e5'
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Video Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/assets/videos/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>



      {/* Hero Section */}
      <section className="relative z-10 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white drop-shadow-lg">Revolutionizing</span>
              <span className="block">
                <ShinyText
                  size="5xl"
                  weight="bold"
                  baseColor="#ffffff"
                  shineColor="#fbbf24"
                  intensity={0.8}
                  speed={4}
                  direction="left-to-right"
                  className="drop-shadow-lg"
                >
                  Healthcare Supply Chain
                </ShinyText>
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white drop-shadow-lg">
              Powered by team Mavericks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated() ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <GradientButton
                    as={Link}
                    to="/login"
                    size="lg"
                    className="font-bold text-black"
                    gradientColors={["#3b82f6", "#1d4ed8", "#1e40af", "#1e3a8a"]}
                    animationSpeed={3}
                  >
                    <ShinyText
                      size="lg"
                      weight="bold"
                      baseColor="#000000"
                      shineColor="#fbbf24"
                      intensity={0.9}
                      speed={3}
                      direction="left-to-right"
                    >
                      Sign In for Full Access
                    </ShinyText>
                  </GradientButton>
                  <GradientButton
                    as={Link}
                    to="/verify"
                    size="lg"
                    variant="outline"
                    className="font-bold text-black border-white"
                    gradientColors={["#ffffff", "#f3f4f6", "#e5e7eb", "#d1d5db"]}
                    animationSpeed={2.5}
                  >
                    <ShinyText
                      size="lg"
                      weight="bold"
                      baseColor="#000000"
                      shineColor="#fbbf24"
                      intensity={0.9}
                      speed={3}
                      direction="left-to-right"
                    >
                      Quick Drug Verification
                    </ShinyText>
                  </GradientButton>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <GradientButton
                    as={Link}
                    to="/dashboard"
                    size="lg"
                    className="font-bold text-black"
                    gradientColors={["#3b82f6", "#1d4ed8", "#1e40af", "#1e3a8a"]}
                    animationSpeed={3}
                  >
                    <ShinyText
                      size="lg"
                      weight="bold"
                      baseColor="#000000"
                      shineColor="#fbbf24"
                      intensity={0.9}
                      speed={3}
                      direction="left-to-right"
                    >
                      Go to Dashboard
                    </ShinyText>
                  </GradientButton>
                  <GradientButton
                    as={Link}
                    to="/verify"
                    size="lg"
                    variant="outline"
                    className="font-bold text-black border-white"
                    gradientColors={["#ffffff", "#f3f4f6", "#e5e7eb", "#d1d5db"]}
                    animationSpeed={2.5}
                  >
                    <ShinyText
                      size="lg"
                      weight="bold"
                      baseColor="#000000"
                      shineColor="#fbbf24"
                      intensity={0.9}
                      speed={3}
                      direction="left-to-right"
                    >
                      Verify Drugs
                    </ShinyText>
                  </GradientButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 bg-white/20 backdrop-blur-md">
        <ParticlesBackground 
          colors={['#3b82f6', '#1d4ed8', '#1e40af']}
          size={2}
          countDesktop={40}
          countTablet={30}
          countMobile={20}
          zIndex={0}
          height="100%"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-4 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg bg-black/80 hover:bg-purple-900/80 backdrop-blur-md border border-white/20 hover:border-purple-300/50"
                >
                  <div className="text-4xl mb-2 text-white">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-white/10 backdrop-blur-md">
        <ParticlesBackground 
          colors={['#6366f1', '#4f46e5', '#3730a3']}
          size={2.5}
          countDesktop={50}
          countTablet={40}
          countMobile={30}
          zIndex={0}
          height="100%"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powered by Blockchain Technology
            </h2>
            <p className="text-xl text-white font-semibold max-w-3xl mx-auto">
              MedChain leverages cutting-edge blockchain technology to ensure transparency, 
              security, and traceability in the pharmaceutical supply chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-black/80 hover:bg-blue-900/80 backdrop-blur-md border border-white/20 hover:border-blue-300/50"
              >
                <div className="text-4xl mb-4 text-white">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white font-semibold">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based Access Section */}
      <section className="relative z-10 py-20 bg-white/20 backdrop-blur-md">
        <ParticlesBackground 
          colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
          size={3}
          countDesktop={60}
          countTablet={50}
          countMobile={40}
          zIndex={0}
          height="100%"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Role-Based Access Control
            </h2>
            <p className="text-xl text-white font-semibold max-w-3xl mx-auto">
              Different stakeholders have tailored interfaces and permissions to ensure 
              secure and efficient operations across the supply chain.
            </p>
          </div>

          <Carousel3D 
            items={carouselItems}
            autoRotate={true}
            rotateInterval={5000}
            cardHeight={450}
            title="Role-Based Access Control"
            subtitle="Dashboard Access"
            tagline="Explore different dashboard interfaces tailored for specific roles in the MedChain ecosystem."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How MedChain Works</h2>
            <p className="text-xl text-white font-semibold max-w-3xl mx-auto">
              A simple, secure, and transparent process that ensures drug authenticity 
              from manufacturer to patient.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-3">Manufacturing</h3>
              <p className="text-white font-semibold">Manufacturer creates drug batches with Merkle tree verification and uploads to IPFS</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-3">Distribution</h3>
              <p className="text-white font-semibold">Distributors receive and verify drug batches, manage inventory and fulfill hospital requests</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-3">Hospital Care</h3>
              <p className="text-white font-semibold">Hospitals verify drug authenticity, manage stock, and dispense to patients</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-xl font-semibold mb-3">Patient Access</h3>
              <p className="text-white font-semibold">Patients access their health records and medication history securely</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 text-white">
        <ReflectBackground className="absolute inset-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to Transform Healthcare?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white">
            Join the future of pharmaceutical supply chain management with MedChain's 
            blockchain-powered platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isConnected ? (
              <GradientButton
                onClick={handleConnectWallet}
                size="lg"
                className="font-bold text-black"
                gradientColors={["#ffffff", "#f3f4f6", "#e5e7eb", "#d1d5db"]}
                animationSpeed={3}
              >
                <ShinyText
                  size="lg"
                  weight="bold"
                  baseColor="#000000"
                  shineColor="#fbbf24"
                  intensity={0.9}
                  speed={3}
                  direction="left-to-right"
                >
                  Connect Wallet
                </ShinyText>
              </GradientButton>
            ) : (
              <GradientButton
                as={Link}
                to="/verify"
                size="lg"
                className="font-bold text-black"
                gradientColors={["#ffffff", "#f3f4f6", "#e5e7eb", "#d1d5db"]}
                animationSpeed={3}
              >
                <ShinyText
                  size="lg"
                  weight="bold"
                  baseColor="#000000"
                  shineColor="#fbbf24"
                  intensity={0.9}
                  speed={3}
                  direction="left-to-right"
                >
                  Start Verifying Drugs
                </ShinyText>
              </GradientButton>
            )}
            
            <GradientButton
              as="a"
              href="#docs"
              size="lg"
              variant="outline"
              className="font-bold text-black border-white"
              gradientColors={["#ffffff", "#f3f4f6", "#e5e7eb", "#d1d5db"]}
              animationSpeed={2.5}
            >
              <ShinyText
                size="lg"
                weight="bold"
                baseColor="#000000"
                shineColor="#fbbf24"
                intensity={0.9}
                speed={3}
                direction="left-to-right"
              >
                View Documentation
              </ShinyText>
            </GradientButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <ParticlesBackground 
          colors={['#1e40af', '#1e3a8a', '#1e293b']}
          size={2}
          countDesktop={30}
          countTablet={25}
          countMobile={20}
          zIndex={0}
          height="100%"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">MedChain</h3>
                  <p className="text-sm text-white font-semibold">Decentralized Healthcare</p>
                </div>
              </div>
              <p className="text-white font-semibold mb-4">
                Revolutionizing pharmaceutical supply chain management and health records with blockchain technology. 
                Ensuring transparency, security, and accessibility in healthcare.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-blue-300 transition-colors font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="text-white hover:text-blue-300 transition-colors font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:text-blue-300 transition-colors font-semibold">Home</a></li>
                <li><a href="#" className="text-white hover:text-blue-300 transition-colors font-semibold">Drug Verification</a></li>
                <li><a href="#" className="text-white hover:text-blue-300 transition-colors font-semibold">Health Records</a></li>
                <li><a href="#" className="text-white hover:text-blue-300 transition-colors font-semibold">About</a></li>
                <li><a href="#" className="text-white hover:text-blue-300 transition-colors font-semibold">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:text-blue-300 transition-colors font-semibold">Documentation</a></li>
                <li><a href="#" className="text-white hover:text-blue-300 transition-colors font-semibold">API Reference</a></li>
                <li><a href="#" className="text-white hover:text-blue-300 transition-colors font-semibold">Whitepaper</a></li>
                <li><a href="#" className="text-white hover:text-blue-300 transition-colors font-semibold">FAQ</a></li>
                <li><a href="#" className="text-white hover:text-blue-300 transition-colors font-semibold">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white font-semibold">© 2024 MedChain. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-white font-semibold">Blockchain Status: Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-white font-semibold">IPFS: Connected</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-white hover:text-blue-300 transition-colors font-semibold">Privacy Policy</a>
              <a href="#" className="text-sm text-white hover:text-blue-300 transition-colors font-semibold">Terms of Service</a>
              <a href="#" className="text-sm text-white hover:text-blue-300 transition-colors font-semibold">Security</a>
            </div>
            <p className="text-sm text-white font-semibold mt-4 md:mt-0">Powered by Ethereum & IPFS</p>
          </div>
        </div>
      </footer>

      {/* Error Popup */}
      <ErrorPopup
        isOpen={showError}
        onClose={() => setShowError(false)}
        onReconnect={handleReconnect}
        errorMessage={errorMessage}
        title="MetaMask Connection Error"
      />
    </div>
  );
};

export default Home;
