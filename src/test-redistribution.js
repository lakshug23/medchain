// Quick test script for the Smart Redistribution Routing System
import { StockoutDetectionService, RouteOptimizationService } from './services/RouteOptimizationService';

const testSmartRedistribution = async () => {
  console.log('🚚 Testing Smart Redistribution Routing System...\n');

  // Test 1: Stockout Detection
  console.log('1. Testing Stockout Detection:');
  const stockouts = await StockoutDetectionService.detectStockouts();
  console.log(`Found ${stockouts.length} stockouts:`);
  stockouts.forEach(stockout => {
    console.log(`  - ${stockout.facilityName}: ${stockout.drug} (Stock: ${stockout.currentStock}, Threshold: ${stockout.threshold})`);
  });
  console.log('');

  // Test 2: Route Optimization for a specific stockout
  if (stockouts.length > 0) {
    const testStockout = stockouts[0];
    console.log(`2. Testing Route Optimization for ${testStockout.facilityName}:`);
    
    const routes = await RouteOptimizationService.findOptimalSources(
      testStockout.facilityId,
      testStockout.drug,
      testStockout.requiredQuantity
    );
    
    console.log(`Found ${routes.length} potential routes:`);
    routes.forEach((route, index) => {
      console.log(`  Route ${index + 1}:`);
      console.log(`    Source: ${route.sourceName}`);
      console.log(`    Distance: ${route.distance.toFixed(1)} km`);
      console.log(`    ETA: ${route.eta}`);
      console.log(`    Cost: $${route.cost.toFixed(2)}`);
      console.log(`    Priority Score: ${route.priority.toFixed(2)}`);
      console.log('');
    });
  }

  // Test 3: Network Overview
  console.log('3. Testing Network Overview:');
  const networkStats = await RouteOptimizationService.getNetworkOverview();
  console.log(`Total Facilities: ${networkStats.totalFacilities}`);
  console.log(`Active Stockouts: ${networkStats.activeStockouts}`);
  console.log(`Average Stock Level: ${networkStats.averageStockLevel.toFixed(1)}%`);
  console.log(`Critical Facilities: ${networkStats.criticalFacilities}`);
  console.log('Critical Drugs:', networkStats.criticalDrugs.join(', '));
};

// Export for use in development console
window.testSmartRedistribution = testSmartRedistribution;

export default testSmartRedistribution;
