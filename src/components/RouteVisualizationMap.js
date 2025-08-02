import React, { useState, useEffect } from 'react';
import { RouteOptimizationService, FACILITIES } from '../services/RouteOptimizationService';

const RouteVisualizationMap = ({ stockout, sources }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, [stockout]);

  const createStaticMapUrl = (stockout, sources) => {
    if (!stockout || !sources.length) return null;

    const markers = [];
    
    // Destination marker (red)
    markers.push(`color:red|label:D|${stockout.coordinates.lat},${stockout.coordinates.lng}`);
    
    // Source markers (different colors based on priority)
    sources.slice(0, 3).forEach((source, index) => {
      const colors = ['green', 'blue', 'orange'];
      const labels = ['1', '2', '3'];
      markers.push(`color:${colors[index]}|label:${labels[index]}|${source.coordinates.lat},${source.coordinates.lng}`);
    });

    const center = `${stockout.coordinates.lat},${stockout.coordinates.lng}`;
    const zoom = 10;
    const size = '600x400';
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${size}&markers=${markers.join('&markers=')}&key=YOUR_API_KEY`;
  };

  const getBoundingBox = (stockout, sources) => {
    const allCoords = [stockout.coordinates, ...sources.map(s => s.coordinates)];
    const lats = allCoords.map(c => c.lat);
    const lngs = allCoords.map(c => c.lng);
    
    return {
      north: Math.max(...lats) + 0.01,
      south: Math.min(...lats) - 0.01,
      east: Math.max(...lngs) + 0.01,
      west: Math.min(...lngs) - 0.01
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <span className="mr-2">🗺️</span>
          Route Visualization
        </h3>
        {stockout && sources.length > 0 && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${sources[0].coordinates.lat},${sources[0].coordinates.lng}&destination=${stockout.coordinates.lat},${stockout.coordinates.lng}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Open in Google Maps ↗
          </a>
        )}
      </div>

      {!stockout ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🗺️</div>
          <p>Select a stockout to view route visualization</p>
        </div>
      ) : !mapLoaded ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading route visualization...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Map Placeholder */}
          <div className="bg-gray-100 rounded-lg p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100"></div>
            <div className="relative z-10 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h4 className="font-medium text-gray-900 mb-2">Interactive Map Visualization</h4>
              <p className="text-sm text-gray-600 mb-4">
                Route from {sources[0]?.name} to {stockout.facilityName}
              </p>
              
              {/* Route Info Overlay */}
              <div className="bg-white rounded-lg p-4 inline-block shadow-sm">
                <div className="flex items-center space-x-4 text-sm">
                  <span><strong>Distance:</strong> {sources[0]?.distance} mi</span>
                  <span><strong>ETA:</strong> {sources[0]?.eta}h</span>
                  <span><strong>Cost:</strong> ${sources[0]?.cost}</span>
                </div>
              </div>
            </div>
            
            {/* Mock waypoints */}
            <div className="absolute top-4 left-4 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border border-white shadow"></div>
          </div>

          {/* Legend */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h5 className="font-medium text-gray-900 mb-2">Legend</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Destination (Stockout)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Recommended Source</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Alternative Source</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span>Peer Transfer</span>
              </div>
            </div>
          </div>

          {/* Route Summary */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h5 className="font-medium text-blue-900 mb-2">Optimal Route Summary</h5>
            <div className="text-sm text-blue-800">
              <p><strong>From:</strong> {sources[0]?.name}</p>
              <p><strong>To:</strong> {stockout.facilityName}</p>
              <p><strong>Drug:</strong> {stockout.drugId.replace('-', ' ')}</p>
              <p><strong>Quantity:</strong> {sources[0]?.canFulfill} units</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteVisualizationMap;
