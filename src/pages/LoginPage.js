import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import TestAccountHelper from '../components/TestAccountHelper';
import GradientButton from '../components/GradientButton';
import ShinyText from '../components/ShinyText';
import UnauthorizedWalletPopup from '../components/UnauthorizedWalletPopup';

const LoginPage = () => {
  const { connectWallet, loginWithEmail, continueAsGuest, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('supply-chain'); // 'supply-chain' | 'public'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUnauthorizedPopup, setShowUnauthorizedPopup] = useState(false);
  const [unauthorizedWallet, setUnauthorizedWallet] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleWalletConnect = async () => {
    setLoading(true);
    setError('');
    try {
      await connectWallet();
      navigate('/dashboard');
    } catch (err) {
      // Check if it's an unauthorized wallet error
      if (err.message.includes('not authorized')) {
        setUnauthorizedWallet(err.walletAddress || 'Unknown');
        setShowUnauthorizedPopup(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginWithEmail(email, password);
      navigate('/verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    setLoading(true);
    try {
      continueAsGuest();
      navigate('/verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Video Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          onLoadStart={() => console.log('Video loading started')}
          onCanPlay={() => console.log('Video can play')}
          onError={(e) => console.error('Video error:', e)}
          style={{ minHeight: '100vh', minWidth: '100vw' }}
        >
          <source src="/assets/videos/background.mp4" type="video/mp4" />
          <source src="/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4">
            <img 
              src="/assets/images/medchain-logo.png" 
              alt="MedChain Logo" 
              className="w-16 h-16 mx-auto rounded-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">MedChain</h1>
          <p className="text-white/90 drop-shadow-lg">Secure Pharmaceutical Supply Chain</p>
        </div>

        {/* Access Type Tabs */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-slate-700/50">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('supply-chain')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'supply-chain'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Supply Chain Access
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'public'
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Public Verification
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {activeTab === 'supply-chain' ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Supply Chain Partners
                  </h3>
                  <p className="text-sm text-white/90">
                    For manufacturers, distributors, and hospitals
                  </p>
                </div>

                <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-lg border border-slate-600/50">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="font-medium text-white font-bold">Wallet Authentication</span>
                  </div>
                  <p className="text-sm text-white/90 mb-3 font-bold">
                    Connect your authorized wallet to access supply chain functions
                  </p>
                  <ul className="text-xs text-white/90 space-y-1 font-bold">
                    <li>• Create and manage drug batches</li>
                    <li>• Transfer and track inventory</li>
                    <li>• Generate QR codes</li>
                    <li>• Access analytics and forecasting</li>
                  </ul>
                </div>

                <GradientButton
                  onClick={handleWalletConnect}
                  disabled={loading}
                  size="lg"
                  className="w-full font-bold text-black"
                  gradientColors={["#3b82f6", "#1d4ed8", "#1e40af", "#1e3a8a"]}
                  animationSpeed={3}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Connecting...
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <ShinyText
                        size="lg"
                        weight="bold"
                        baseColor="#000000"
                        shineColor="#fbbf24"
                        intensity={0.9}
                        speed={3}
                        direction="left-to-right"
                      >
                        Connect MetaMask Wallet
                      </ShinyText>
                    </>
                  )}
                </GradientButton>

                <div className="text-xs text-white/80 text-center font-bold">
                  Need wallet authorization? Contact your system administrator
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Drug Verification
                  </h3>
                  <p className="text-sm text-white/90">
                    Verify drug authenticity and view supply chain information
                  </p>
                </div>

                {/* Email Login Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 border border-slate-600/50 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-800/60 backdrop-blur-sm text-white placeholder-white/60"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="For verified access (optional)"
                      className="w-full px-3 py-2 border border-slate-600/50 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-slate-800/60 backdrop-blur-sm text-white placeholder-white/60"
                    />
                    <p className="text-xs text-white/80 mt-1">
                      Leave blank for basic verification access
                    </p>
                  </div>

                  <GradientButton
                    type="submit"
                    disabled={loading || !email}
                    size="lg"
                    className="w-full font-bold text-black"
                    gradientColors={["#10b981", "#059669", "#047857", "#065f46"]}
                    animationSpeed={3}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                        Signing In...
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <ShinyText
                          size="lg"
                          weight="bold"
                          baseColor="#000000"
                          shineColor="#fbbf24"
                          intensity={0.9}
                          speed={3}
                          direction="left-to-right"
                        >
                          Continue with Email
                        </ShinyText>
                      </>
                    )}
                  </GradientButton>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                {/* Guest Access */}
                <GradientButton
                  onClick={handleGuestAccess}
                  disabled={loading}
                  size="lg"
                  variant="outline"
                  className="w-full font-bold text-black border-gray-300"
                  gradientColors={["#6b7280", "#4b5563", "#374151", "#1f2937"]}
                  animationSpeed={3}
                >
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <ShinyText
                    size="lg"
                    weight="bold"
                    baseColor="#000000"
                    shineColor="#fbbf24"
                    intensity={0.9}
                    speed={3}
                    direction="left-to-right"
                  >
                    Continue as Guest
                  </ShinyText>
                </GradientButton>

                <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-lg border border-slate-600/50">
                  <div className="text-sm text-white/90">
                    <p className="font-medium mb-1 font-bold">Public Access Features:</p>
                    <ul className="text-xs space-y-1 font-bold">
                      <li>• Scan QR codes to verify drug authenticity</li>
                      <li>• View basic supply chain information</li>
                      <li>• Check expiration dates and batch details</li>
                      <li>• No registration required for guest access</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Account Helper Section */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/50 p-6 mt-6">
          <TestAccountHelper />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-white/80">
          <p>Powered by blockchain technology</p>
          <p className="mt-1">Secure • Transparent • Immutable</p>
        </div>
      </div>

      {/* Unauthorized Wallet Popup */}
      <UnauthorizedWalletPopup
        isOpen={showUnauthorizedPopup}
        onClose={() => setShowUnauthorizedPopup(false)}
        onReconnect={() => {
          setShowUnauthorizedPopup(false);
          handleWalletConnect();
        }}
        walletAddress={unauthorizedWallet}
      />
    </div>
  );
};

export default LoginPage;
