import QRCode from 'qrcode';

/**
 * QR Code utilities for drug tracking
 */

// Generate unique tracking data for QR code
export const generateTrackingData = (batchId, drugName, manufacturer, manufactureDateTimestamp) => {
  const trackingData = {
    batchId: batchId.toString(),
    drugName,
    manufacturer,
    manufactureDate: manufactureDateTimestamp,
    timestamp: Date.now(),
    version: '1.0'
  };
  
  // Create a verifiable string that includes hash for tamper detection
  const dataString = JSON.stringify(trackingData);
  const trackingString = btoa(dataString); // Base64 encode for QR code
  
  return {
    trackingData,
    trackingString,
    verificationUrl: `${window.location.origin}/verify/${batchId}`
  };
};

// Generate QR code as data URL
export const generateQRCode = async (trackingString) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(trackingString, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Parse QR code data
export const parseQRData = (qrData) => {
  try {
    const decodedData = atob(qrData);
    const trackingData = JSON.parse(decodedData);
    return trackingData;
  } catch (error) {
    console.error('Error parsing QR data:', error);
    return null;
  }
};

// Generate printable QR code with batch info
export const generatePrintableQR = async (batchId, drugName, manufacturer, manufactureDateTimestamp) => {
  const { trackingString } = generateTrackingData(batchId, drugName, manufacturer, manufactureDateTimestamp);
  const qrCodeDataURL = await generateQRCode(trackingString);
  
  return {
    qrCodeDataURL,
    batchId: batchId.toString(),
    drugName,
    manufacturer,
    manufactureDate: new Date(manufactureDateTimestamp * 1000).toLocaleDateString(),
    trackingString
  };
};

// Validate QR code data integrity
export const validateQRData = (trackingData, expectedBatchId) => {
  if (!trackingData || !trackingData.batchId) {
    return { valid: false, reason: 'Invalid QR code data' };
  }
  
  if (trackingData.batchId !== expectedBatchId.toString()) {
    return { valid: false, reason: 'Batch ID mismatch' };
  }
  
  // Check if QR code is not too old (optional security measure)
  const qrAge = Date.now() - trackingData.timestamp;
  const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
  
  if (qrAge > maxAge) {
    return { valid: false, reason: 'QR code expired' };
  }
  
  return { valid: true, reason: 'Valid QR code' };
};
