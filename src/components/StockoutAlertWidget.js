import React, { useState, useEffect } from 'react';
import { StockoutDetectionService, RouteOptimizationService, FACILITIES } from '../services/RouteOptimizationService';

const StockoutAlertWidget = () => {
  const [stockouts, setStockouts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    detectStockouts();
    // Refresh every 5 minutes
    const interval = setInterval(detectStockouts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const detectStockouts = () => {
    setLoading(true);
    const detectedStockouts = StockoutDetectionService.detectStockouts(FACILITIES, 7);
    setStockouts(detectedStockouts.slice(0, 5)); // Show top 5 most urgent
    setLoading(false);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const criticalCount = stockouts.filter(s => s.urgency === 'critical').length;
  const highCount = stockouts.filter(s => s.urgency === 'high').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <span className="mr-2">🚨</span>
          Stockout Alerts
        </h3>
        <button
          onClick={detectStockouts}
          disabled={loading}
          className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {loading ? '🔄' : '↻'} Refresh
        </button>
      </div>

      {stockouts.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-sm text-gray-500">No stockouts detected</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="flex space-x-4 mb-4 text-xs">
            {criticalCount > 0 && (
              <span className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                {criticalCount} Critical
              </span>
            )}
            {highCount > 0 && (
              <span className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                {highCount} High
              </span>
            )}
          </div>

          {/* Stockout List */}
          <div className="space-y-3">
            {stockouts.map((stockout, index) => (
              <div key={index} className="border-l-4 border-gray-200 pl-3 py-2">
                <div className={`w-1 h-full absolute left-0 ${getUrgencyColor(stockout.urgency)}`}></div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {stockout.facilityName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {stockout.drugId.replace('-', ' ')} • {stockout.daysUntilStockout} days left
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getUrgencyColor(stockout.urgency)}`}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t">
            <button className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium">
              View All Alerts →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StockoutAlertWidget;
