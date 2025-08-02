import React, { useState, useEffect } from 'react';
import { generateTrackingData, generateQRCode } from '../utils/qrcode';

const QRTestPage = () => {
  const [qrCodeUrl, setQRCodeUrl] = useState('');
  const [trackingString, setTrackingString] = useState('');

  useEffect(() => {
    generateTestQR();
  }, []);

  const generateTestQR = async () => {
    try {
      // Generate test tracking data
      const testData = generateTrackingData(
        '12345', // batchId
        'Paracetamol 500mg', // drugName
        'PharmaCorp Ltd', // manufacturer
        Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days ago
      );

      console.log('Generated tracking data:', testData);
      setTrackingString(testData.trackingString);

      // Generate QR code
      const qrUrl = await generateQRCode(testData.trackingString);
      setQRCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating test QR:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Test Page</h1>
          <p className="text-gray-600">Use this QR code to test the enhanced scanner</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Test QR Code</h2>
          
          {qrCodeUrl && (
            <div className="text-center mb-6">
              <img 
                src={qrCodeUrl} 
                alt="Test QR Code" 
                className="mx-auto border-2 border-gray-300 rounded-lg"
              />
              <p className="mt-2 text-sm text-gray-600">Scan this with the drug verification scanner</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking String (for manual testing):
              </label>
              <textarea
                value={trackingString}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                rows="4"
              />
              <p className="mt-1 text-xs text-gray-500">
                Copy this string and paste it in the manual entry field of the QR scanner
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Test Information:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>Batch ID:</strong> 12345</li>
                <li><strong>Drug:</strong> Paracetamol 500mg</li>
                <li><strong>Manufacturer:</strong> PharmaCorp Ltd</li>
                <li><strong>Generated:</strong> {new Date().toLocaleString()}</li>
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={generateTestQR}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generate New Test QR
              </button>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Instructions:</h3>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Go to the <a href="/verify-drugs" className="underline text-blue-600">Drug Verification page</a></li>
                <li>Either scan the QR code above with your camera, or</li>
                <li>Copy the tracking string and paste it in the manual entry field</li>
                <li>You should see detailed batch information and supply chain history</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRTestPage;
