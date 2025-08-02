import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import GradientButton from './GradientButton';

const TestAccountHelper = () => {
  const [showAddresses, setShowAddresses] = useState(false);
  const { connectWallet } = useAuth();

  const testAccounts = [
    {
      address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      role: 'Admin/Developer',
      name: 'System Administrator',
      description: 'Full system access and management - Access to all dashboards'
    },
    {
      address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
      role: 'Manufacturer',
      name: 'PharmaCorp Manufacturing',
      description: 'Manufacturer dashboard and AI forecasting'
    },
    {
      address: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
      privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
      role: 'Distributor',
      name: 'Global Distribution Network',
      description: 'Distributor dashboard and AI forecasting'
    },
    {
      address: '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
      privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
      role: 'Hospital',
      name: 'City General Hospital',
      description: 'Hospital dashboard, AI forecasting, and Health Records'
    },
    {
      address: '0x15d34aaf54267db7d7c367839aa71a002c6a65',
      privateKey: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
      role: 'Patient',
      name: 'Patient Services',
      description: 'AI forecasting access'
    }
  ];

  const copyToClipboard = async (text, event) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show a temporary success message
      const originalText = event.target.textContent;
      event.target.textContent = '✓ Copied!';
      event.target.style.color = '#10b981';
      setTimeout(() => {
        event.target.textContent = originalText;
        event.target.style.color = '';
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Show success message
      const originalText = event.target.textContent;
      event.target.textContent = '✓ Copied!';
      event.target.style.color = '#10b981';
      setTimeout(() => {
        event.target.textContent = originalText;
        event.target.style.color = '';
      }, 2000);
    }
  };

  const handleQuickConnect = async (address) => {
    try {
      // This is a helper function - in a real scenario, users would need to import these accounts
      alert(`To use this account, please import the private key for ${address} into MetaMask.\n\nFor testing purposes, you can use Hardhat's default private keys.`);
    } catch (error) {
      console.error('Error with quick connect:', error);
    }
  };

  return (
    <div className="bg-transparent">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white font-bold">Test Account Helper</h3>
        <GradientButton
          onClick={() => setShowAddresses(!showAddresses)}
          size="md"
          className="font-bold text-black"
          gradientColors={["#3b82f6", "#1d4ed8", "#1e40af", "#1e3a8a"]}
          animationSpeed={3}
        >
          {showAddresses ? 'Hide' : 'Show'} Test Accounts
        </GradientButton>
      </div>

      {showAddresses && (
        <div className="space-y-4">
          <p className="text-sm text-white/90 mb-4 font-bold">
            These are the authorized test accounts for the MedChain system. 
            Import these accounts into MetaMask to test different user roles.
          </p>
          
          <div className="space-y-4">
            {testAccounts.map((account, index) => (
              <div key={index} className="bg-slate-800/60 backdrop-blur-md rounded-lg p-4 border border-slate-600/50">
                <div className="flex items-start justify-between mb-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded font-bold">
                    {account.role}
                  </span>
                  <button
                    onClick={(e) => copyToClipboard(account.address, e)}
                    className="text-xs text-white/80 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-white/10 transition-colors"
                    title="Copy address"
                  >
                    📋
                  </button>
                </div>
                
                <h4 className="font-medium text-white mb-1 font-bold">{account.name}</h4>
                <p className="text-xs text-white/90 mb-3 font-bold">{account.description}</p>
                
                                 <div className="space-y-2">
                   <div className="text-xs">
                     <span className="text-white/90 font-bold">Address:</span>
                     <div className="font-mono text-white/80 break-all font-bold">
                       {account.address}
                     </div>
                   </div>
                   
                   <div className="text-xs">
                     <span className="text-white/90 font-bold">Private Key:</span>
                     <div className="flex items-center gap-1">
                       <div className="font-mono text-white/80 break-all flex-1 font-bold">
                         {account.privateKey}
                       </div>
                       <button
                         onClick={(e) => copyToClipboard(account.privateKey, e)}
                         className="text-xs text-white/80 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-white/10 transition-colors"
                         title="Copy private key"
                       >
                         📋
                       </button>
                     </div>
                   </div>
                   
                   <GradientButton
                     onClick={() => handleQuickConnect(account.address)}
                     size="sm"
                     className="w-full font-bold text-black"
                     gradientColors={["#10b981", "#059669", "#047857", "#065f46"]}
                     animationSpeed={3}
                   >
                     Use This Account
                   </GradientButton>
                 </div>
              </div>
            ))}
          </div>

                     <div className="mt-6 p-4 bg-yellow-100/90 backdrop-blur-md border border-yellow-300/50 rounded-lg">
             <h4 className="font-medium text-yellow-900 mb-2 font-bold">How to Import Test Accounts</h4>
             <ol className="text-sm text-yellow-800 space-y-1 font-bold">
               <li>1. Open MetaMask and click on the account icon</li>
               <li>2. Select "Import Account"</li>
               <li>3. Copy and paste one of the private keys above</li>
               <li>4. Click "Import"</li>
               <li>5. Make sure you are connected to localhost:8545 (Hardhat network)</li>
               <li>6. The account will automatically be recognized by the system</li>
             </ol>
             
             <div className="mt-3 p-3 bg-yellow-200/80 backdrop-blur-md border border-yellow-400/50 rounded">
               <h5 className="font-medium text-yellow-900 mb-1 font-bold">Network Configuration:</h5>
               <div className="text-xs text-yellow-800 space-y-1 font-bold">
                 <div>Network Name: Hardhat Local</div>
                 <div>RPC URL: http://localhost:8545</div>
                 <div>Chain ID: 31337</div>
                 <div>Currency Symbol: ETH</div>
               </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TestAccountHelper;
