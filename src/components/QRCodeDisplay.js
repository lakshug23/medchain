import React, { useState, useEffect } from 'react';
import { generatePrintableQR } from '../utils/qrcode';

const QRCodeDisplay = ({ batchId, drugName, manufacturer, manufactureDateTimestamp, size = 200 }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateQR();
  }, [batchId, drugName, manufacturer, manufactureDateTimestamp]);

  const generateQR = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const qrInfo = await generatePrintableQR(
        batchId, 
        drugName, 
        manufacturer, 
        manufactureDateTimestamp
      );
      
      setQrData(qrInfo);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;
    
    const link = document.createElement('a');
    link.download = `QR_${drugName}_Batch_${batchId}.png`;
    link.href = qrData.qrCodeDataURL;
    link.click();
  };

  const printQR = () => {
    if (!qrData) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Drug QR Code - Batch ${batchId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .qr-container {
              border: 2px solid #333;
              padding: 20px;
              margin: 20px auto;
              max-width: 400px;
            }
            .qr-info {
              margin: 10px 0;
              font-size: 14px;
            }
            .batch-id {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            img {
              border: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="batch-id">Batch ID: ${qrData.batchId}</div>
            <img src="${qrData.qrCodeDataURL}" alt="QR Code" style="width: 250px; height: 250px;" />
            <div class="qr-info"><strong>Drug:</strong> ${qrData.drugName}</div>
            <div class="qr-info"><strong>Manufacturer:</strong> ${qrData.manufacturer}</div>
            <div class="qr-info"><strong>Manufacture Date:</strong> ${qrData.manufactureDate}</div>
            <div class="qr-info" style="font-size: 12px; margin-top: 15px;">
              <strong>Tracking ID:</strong><br>
              <span style="word-break: break-all; font-family: monospace;">${qrData.trackingString}</span>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Generating QR Code...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={generateQR}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!qrData) return null;

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-3">Drug Tracking QR Code</h3>
        
        <div className="mb-4">
          <img 
            src={qrData.qrCodeDataURL} 
            alt="Drug Tracking QR Code"
            className="mx-auto border border-gray-300 rounded"
            style={{ width: size, height: size }}
          />
        </div>
        
        <div className="text-sm space-y-1 mb-4">
          <div><strong>Batch ID:</strong> {qrData.batchId}</div>
          <div><strong>Drug:</strong> {qrData.drugName}</div>
          <div><strong>Manufacturer:</strong> {qrData.manufacturer}</div>
          <div><strong>Manufacture Date:</strong> {qrData.manufactureDate}</div>
        </div>
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={downloadQR}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Download QR
          </button>
          <button
            onClick={printQR}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Print Label
          </button>
        </div>
        
        <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
          <strong>Tracking String:</strong>
          <div className="font-mono text-gray-600 break-all mt-1">
            {qrData.trackingString}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
