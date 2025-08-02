import React from 'react';
import GradientButton from './GradientButton';
import ShinyText from './ShinyText';

const UnauthorizedWalletPopup = ({
  isOpen,
  onClose,
  onReconnect,
  walletAddress,
  title = "Unauthorized Wallet"
}) => {
  if (!isOpen) return null;

  const authorizedAccounts = [
    { address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', role: 'Admin/Developer' },
    { address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', role: 'Manufacturer' },
    { address: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc', role: 'Distributor' },
    { address: '0x90f79bf6eb2c4f870365e785982e1f101e93b906', role: 'Hospital' },
    { address: '0x15d34aaf54267db7d7c367839aa71a002c6a65', role: 'Patient' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all duration-300 scale-100 border border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-sm text-white/70">Wallet Authorization Required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Error Message */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-2">
                    Wallet <span className="text-red-400 font-mono">{walletAddress}</span> is not authorized for supply chain access.
                  </p>
                  <p className="text-white/80 text-sm">
                    Please connect one of the authorized test accounts listed below.
                  </p>
                </div>
              </div>
            </div>

            {/* Authorized Accounts */}
            <div className="bg-slate-800/60 backdrop-blur-md rounded-lg border border-slate-600/50 p-4">
              <h4 className="text-white font-bold mb-3 flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Authorized Test Accounts
              </h4>
              <div className="space-y-3">
                {authorizedAccounts.map((account, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg border border-slate-600/30">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="inline-block px-2 py-1 text-xs font-bold bg-blue-500/20 text-blue-300 rounded">
                          {account.role}
                        </span>
                        <span className="text-white/90 font-mono text-sm">
                          {account.address}
                        </span>
                      </div>
                    </div>
                                         <button
                       onClick={(e) => {
                         navigator.clipboard.writeText(account.address);
                         // Show temporary success
                         const btn = e.target;
                         const originalText = btn.textContent;
                         btn.textContent = '✓ Copied!';
                         btn.className = 'px-3 py-1 text-xs bg-green-600 text-white rounded font-bold';
                         setTimeout(() => {
                           btn.textContent = originalText;
                           btn.className = 'px-3 py-1 text-xs bg-blue-600 text-white rounded font-bold hover:bg-blue-700';
                         }, 2000);
                       }}
                       className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors"
                     >
                       Copy
                     </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-2">How to Connect Authorized Account:</p>
                  <ol className="text-white/80 text-sm space-y-1">
                    <li>1. Copy one of the authorized addresses above</li>
                    <li>2. Open MetaMask and import the account using its private key</li>
                    <li>3. Make sure you're connected to localhost:8545 (Hardhat network)</li>
                    <li>4. Reconnect your wallet to MedChain</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t border-slate-700/50">
          <GradientButton
            onClick={onReconnect}
            size="md"
            className="flex-1 font-bold text-black"
            gradientColors={["#3b82f6", "#1d4ed8", "#1e40af", "#1e3a8a"]}
            animationSpeed={3}
          >
            <ShinyText
              size="md"
              weight="bold"
              baseColor="#000000"
              shineColor="#fbbf24"
              intensity={0.9}
              speed={3}
              direction="left-to-right"
            >
              Reconnect Wallet
            </ShinyText>
          </GradientButton>
          <GradientButton
            onClick={onClose}
            size="md"
            variant="outline"
            className="font-bold text-black border-slate-600"
            gradientColors={["#6b7280", "#4b5563", "#374151", "#1f2937"]}
            animationSpeed={3}
          >
            <ShinyText
              size="md"
              weight="bold"
              baseColor="#000000"
              shineColor="#fbbf24"
              intensity={0.9}
              speed={3}
              direction="left-to-right"
            >
              Close
            </ShinyText>
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedWalletPopup; 