import React, { useState, useEffect } from 'react';
import { StockoutDetectionService, RouteOptimizationService, FACILITIES } from '../services/RouteOptimizationService';

const SmartRedistributionDashboard = () => {
  const [stockouts, setStockouts] = useState([]);
  const [selectedStockout, setSelectedStockout] = useState(null);
  const [routeRecommendations, setRouteRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts');

  useEffect(() => {
    detectStockouts();
  }, []);

  const detectStockouts = () => {
    setLoading(true);
    const detectedStockouts = StockoutDetectionService.detectStockouts(FACILITIES);
    setStockouts(detectedStockouts);
    setLoading(false);
  };

  const generateRouteRecommendations = (stockout) => {
    setLoading(true);
    setSelectedStockout(stockout);
    
    const sources = RouteOptimizationService.findOptimalSources(stockout, FACILITIES);
    setRouteRecommendations(sources);
    setLoading(false);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1: return 'Distributor';
      case 2: return 'Manufacturer';
      case 3: return 'Peer Transfer';
      default: return 'Unknown';
    }
  };

  const formatETA = (eta) => {
    const hours = Math.floor(eta);
    const minutes = Math.round((eta - hours) * 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const createGoogleMapsUrl = (source, destination) => {
    const origin = `${source.coordinates.lat},${source.coordinates.lng}`;
    const dest = `${destination.coordinates.lat},${destination.coordinates.lng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-3xl mr-3">🚚</span>
              Smart Drug Redistribution System
            </h1>
            <p className="text-gray-600 mt-1">
              Automated stockout detection and optimal route planning
            </p>
          </div>
          <button
            onClick={detectStockouts}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <span className="mr-2">🔄</span>
            )}
            Refresh Analysis
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'bg-red-50 text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🚨 Stockout Alerts ({stockouts.length})
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'routes'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🗺️ Route Recommendations
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'network'
                ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🌐 Network Overview
          </button>
        </div>

        {/* Stockout Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="p-6">
            {stockouts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Stockouts Detected</h3>
                <p className="text-gray-500">All facilities have adequate stock levels.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stockouts.map((stockout, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{stockout.facilityName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(stockout.urgency)}`}>
                            {stockout.urgency.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">
                            {stockout.facilityType}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Drug:</span>
                            <p className="font-medium capitalize">{stockout.drugId.replace('-', ' ')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Current Stock:</span>
                            <p className="font-medium">{stockout.currentStock} units</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Days Until Stockout:</span>
                            <p className="font-medium text-red-600">{stockout.daysUntilStockout} days</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Required Quantity:</span>
                            <p className="font-medium">{stockout.requiredQuantity} units</p>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => generateRouteRecommendations(stockout)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        🗺️ Find Routes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Route Recommendations Tab */}
        {activeTab === 'routes' && (
          <div className="p-6">
            {!selectedStockout ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Stockout Alert</h3>
                <p className="text-gray-500">Choose a stockout from the alerts tab to see route recommendations.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Selected Stockout Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Route Planning For:</h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <span><strong>Facility:</strong> {selectedStockout.facilityName}</span>
                    <span><strong>Drug:</strong> {selectedStockout.drugId.replace('-', ' ')}</span>
                    <span><strong>Required:</strong> {selectedStockout.requiredQuantity} units</span>
                  </div>
                </div>

                {/* Route Recommendations */}
                {routeRecommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-gray-500">No suitable sources found for this stockout.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {routeRecommendations.map((source, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${index === 0 ? 'border-green-300 bg-green-50' : ''}`}
                      >
                        {index === 0 && (
                          <div className="mb-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                              ⭐ RECOMMENDED
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h4 className="font-semibold text-gray-900">{source.name}</h4>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getPriorityLabel(source.priority)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div>
                                <span className="text-gray-500">Distance:</span>
                                <p className="font-medium">{source.distance} miles</p>
                              </div>
                              <div>
                                <span className="text-gray-500">ETA:</span>
                                <p className="font-medium">{formatETA(source.eta)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Available:</span>
                                <p className="font-medium">{source.availableStock} units</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Can Fulfill:</span>
                                <p className="font-medium text-green-600">{source.canFulfill} units</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <span><strong>Cost:</strong> ${source.cost}</span>
                              <span><strong>Score:</strong> {Math.round(source.score)}/100</span>
                              <span><strong>Contact:</strong> {source.contact}</span>
                            </div>
                          </div>
                          
                          <div className="ml-4 space-y-2">
                            <a
                              href={createGoogleMapsUrl(source, selectedStockout)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                            >
                              🗺️ View Route
                            </a>
                            <button
                              onClick={() => {
                                // In real implementation, this would initiate the transfer
                                alert(`Transfer request initiated:\n${source.canFulfill} units from ${source.name}\nETA: ${formatETA(source.eta)}`);
                              }}
                              className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              📦 Request Transfer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Network Overview Tab */}
        {activeTab === 'network' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Manufacturers */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="mr-2">🏭</span>
                  Manufacturers ({FACILITIES.manufacturers.length})
                </h3>
                <div className="space-y-2 text-sm">
                  {FACILITIES.manufacturers.map(facility => (
                    <div key={facility.id} className="flex justify-between">
                      <span className="text-blue-700">{facility.name}</span>
                      <span className="text-blue-600 font-medium">
                        {Object.values(facility.stockLevels).reduce((a, b) => a + b, 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distributors */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <span className="mr-2">🚛</span>
                  Distributors ({FACILITIES.distributors.length})
                </h3>
                <div className="space-y-2 text-sm">
                  {FACILITIES.distributors.map(facility => (
                    <div key={facility.id} className="flex justify-between">
                      <span className="text-green-700">{facility.name}</span>
                      <span className="text-green-600 font-medium">
                        {Object.values(facility.stockLevels).reduce((a, b) => a + b, 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hospitals */}
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center">
                  <span className="mr-2">🏥</span>
                  Hospitals ({FACILITIES.hospitals.length})
                </h3>
                <div className="space-y-2 text-sm">
                  {FACILITIES.hospitals.map(facility => (
                    <div key={facility.id} className="flex justify-between">
                      <span className="text-red-700">{facility.name}</span>
                      <span className="text-red-600 font-medium">
                        {Object.values(facility.stockLevels).reduce((a, b) => a + b, 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pharmacies */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                  <span className="mr-2">💊</span>
                  Pharmacies ({FACILITIES.pharmacies.length})
                </h3>
                <div className="space-y-2 text-sm">
                  {FACILITIES.pharmacies.map(facility => (
                    <div key={facility.id} className="flex justify-between">
                      <span className="text-purple-700">{facility.name}</span>
                      <span className="text-purple-600 font-medium">
                        {Object.values(facility.stockLevels).reduce((a, b) => a + b, 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Network Stats */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Network Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {FACILITIES.manufacturers.length + FACILITIES.distributors.length + 
                     FACILITIES.hospitals.length + FACILITIES.pharmacies.length}
                  </div>
                  <div className="text-gray-600">Total Facilities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stockouts.filter(s => s.urgency === 'critical').length}
                  </div>
                  <div className="text-gray-600">Critical Alerts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stockouts.filter(s => s.urgency === 'high').length}
                  </div>
                  <div className="text-gray-600">High Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {Math.round(stockouts.reduce((acc, s) => acc + s.distance || 0, 0) / stockouts.length) || 0}
                  </div>
                  <div className="text-gray-600">Avg Distance (mi)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartRedistributionDashboard;
