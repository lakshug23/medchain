import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Mock facility database with coordinates and stock levels
const FACILITIES = {
  manufacturers: [
    {
      id: 'MFG001',
      name: 'PharmaCorp Manufacturing',
      type: 'manufacturer',
      address: '123 Industrial Blvd, San Francisco, CA',
      coordinates: { lat: 37.7749, lng: -122.4194 },
      contact: '+1-555-0101',
      stockLevels: {
        'paracetamol-500mg': 50000,
        'amoxicillin-250mg': 30000,
        'aspirin-100mg': 75000,
        'ibuprofen-400mg': 40000
      },
      capacity: 100000,
      weeklyProduction: 25000
    },
    {
      id: 'MFG002',
      name: 'MediPharma Industries',
      type: 'manufacturer',
      address: '456 Pharma Way, Los Angeles, CA',
      coordinates: { lat: 34.0522, lng: -118.2437 },
      contact: '+1-555-0102',
      stockLevels: {
        'paracetamol-500mg': 35000,
        'amoxicillin-250mg': 45000,
        'aspirin-100mg': 60000,
        'ibuprofen-400mg': 55000
      },
      capacity: 120000,
      weeklyProduction: 30000
    }
  ],
  distributors: [
    {
      id: 'DIST001',
      name: 'Global Distribution Network',
      type: 'distributor',
      address: '789 Logistics Ave, Oakland, CA',
      coordinates: { lat: 37.8044, lng: -122.2711 },
      contact: '+1-555-0201',
      stockLevels: {
        'paracetamol-500mg': 8000,
        'amoxicillin-250mg': 5000,
        'aspirin-100mg': 12000,
        'ibuprofen-400mg': 7500
      },
      capacity: 50000,
      deliveryRadius: 100 // miles
    },
    {
      id: 'DIST002',
      name: 'Regional Pharma Logistics',
      type: 'distributor',
      address: '321 Supply Chain Dr, San Jose, CA',
      coordinates: { lat: 37.3382, lng: -121.8863 },
      contact: '+1-555-0202',
      stockLevels: {
        'paracetamol-500mg': 6500,
        'amoxicillin-250mg': 8000,
        'aspirin-100mg': 9000,
        'ibuprofen-400mg': 5500
      },
      capacity: 40000,
      deliveryRadius: 80
    }
  ],
  hospitals: [
    {
      id: 'HOSP001',
      name: 'City General Hospital',
      type: 'hospital',
      address: '555 Medical Center Dr, San Francisco, CA',
      coordinates: { lat: 37.7849, lng: -122.4094 },
      contact: '+1-555-0301',
      stockLevels: {
        'paracetamol-500mg': 150,
        'amoxicillin-250mg': 80,
        'aspirin-100mg': 200,
        'ibuprofen-400mg': 120
      },
      capacity: 2000,
      dailyConsumption: {
        'paracetamol-500mg': 25,
        'amoxicillin-250mg': 15,
        'aspirin-100mg': 30,
        'ibuprofen-400mg': 20
      },
      minimumStock: {
        'paracetamol-500mg': 100,
        'amoxicillin-250mg': 50,
        'aspirin-100mg': 150,
        'ibuprofen-400mg': 80
      }
    },
    {
      id: 'HOSP002',
      name: 'Metropolitan Medical Center',
      type: 'hospital',
      address: '777 Healthcare Way, Berkeley, CA',
      coordinates: { lat: 37.8715, lng: -122.2730 },
      contact: '+1-555-0302',
      stockLevels: {
        'paracetamol-500mg': 75,
        'amoxicillin-250mg': 45,
        'aspirin-100mg': 110,
        'ibuprofen-400mg': 65
      },
      capacity: 1500,
      dailyConsumption: {
        'paracetamol-500mg': 20,
        'amoxicillin-250mg': 12,
        'aspirin-100mg': 25,
        'ibuprofen-400mg': 15
      },
      minimumStock: {
        'paracetamol-500mg': 80,
        'amoxicillin-250mg': 40,
        'aspirin-100mg': 120,
        'ibuprofen-400mg': 60
      }
    },
    {
      id: 'HOSP003',
      name: 'Valley Emergency Care',
      type: 'hospital',
      address: '999 Emergency Blvd, Palo Alto, CA',
      coordinates: { lat: 37.4419, lng: -122.1430 },
      contact: '+1-555-0303',
      stockLevels: {
        'paracetamol-500mg': 40,
        'amoxicillin-250mg': 25,
        'aspirin-100mg': 60,
        'ibuprofen-400mg': 35
      },
      capacity: 800,
      dailyConsumption: {
        'paracetamol-500mg': 15,
        'amoxicillin-250mg': 8,
        'aspirin-100mg': 18,
        'ibuprofen-400mg': 12
      },
      minimumStock: {
        'paracetamol-500mg': 60,
        'amoxicillin-250mg': 30,
        'aspirin-100mg': 90,
        'ibuprofen-400mg': 45
      }
    }
  ],
  pharmacies: [
    {
      id: 'PHARM001',
      name: 'Central Pharmacy',
      type: 'pharmacy',
      address: '123 Main St, San Francisco, CA',
      coordinates: { lat: 37.7849, lng: -122.4194 },
      contact: '+1-555-0401',
      stockLevels: {
        'paracetamol-500mg': 300,
        'amoxicillin-250mg': 180,
        'aspirin-100mg': 450,
        'ibuprofen-400mg': 220
      },
      capacity: 5000,
      dailyConsumption: {
        'paracetamol-500mg': 35,
        'amoxicillin-250mg': 20,
        'aspirin-100mg': 40,
        'ibuprofen-400mg': 25
      },
      minimumStock: {
        'paracetamol-500mg': 200,
        'amoxicillin-250mg': 100,
        'aspirin-100mg': 300,
        'ibuprofen-400mg': 150
      }
    },
    {
      id: 'PHARM002',
      name: 'Bay Area Pharmacy',
      type: 'pharmacy',
      address: '456 Bay St, Oakland, CA',
      coordinates: { lat: 37.8044, lng: -122.2711 },
      contact: '+1-555-0402',
      stockLevels: {
        'paracetamol-500mg': 180,
        'amoxicillin-250mg': 120,
        'aspirin-100mg': 280,
        'ibuprofen-400mg': 160
      },
      capacity: 4000,
      dailyConsumption: {
        'paracetamol-500mg': 30,
        'amoxicillin-250mg': 18,
        'aspirin-100mg': 35,
        'ibuprofen-400mg': 22
      },
      minimumStock: {
        'paracetamol-500mg': 150,
        'amoxicillin-250mg': 80,
        'aspirin-100mg': 250,
        'ibuprofen-400mg': 120
      }
    }
  ]
};

// Stock prediction and routing algorithms
export class StockoutDetectionService {
  static detectStockouts(facilities, days = 7) {
    const stockouts = [];
    
    [...facilities.hospitals, ...facilities.pharmacies].forEach(facility => {
      Object.keys(facility.stockLevels).forEach(drugId => {
        const currentStock = facility.stockLevels[drugId];
        const dailyConsumption = facility.dailyConsumption[drugId];
        const minimumStock = facility.minimumStock[drugId];
        const daysUntilStockout = Math.floor(currentStock / dailyConsumption);
        
        if (daysUntilStockout <= days || currentStock <= minimumStock * 1.2) {
          stockouts.push({
            facilityId: facility.id,
            facilityName: facility.name,
            facilityType: facility.type,
            drugId,
            currentStock,
            dailyConsumption,
            minimumStock,
            daysUntilStockout,
            urgency: daysUntilStockout <= 2 ? 'critical' : daysUntilStockout <= 5 ? 'high' : 'medium',
            requiredQuantity: Math.max(minimumStock * 2 - currentStock, dailyConsumption * 7),
            coordinates: facility.coordinates
          });
        }
      });
    });
    
    return stockouts.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
  }
}

export class RouteOptimizationService {
  static calculateDistance(coord1, coord2) {
    // Haversine formula for calculating distance between two coordinates
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  static calculateETA(distance, transportMode = 'truck') {
    const speeds = {
      truck: 45, // mph average with traffic
      express: 65, // mph for urgent deliveries
      local: 25  // mph for local transfers
    };
    
    const speed = speeds[transportMode] || speeds.truck;
    const travelTime = distance / speed;
    const loadingTime = 0.5; // 30 minutes for loading/unloading
    
    return travelTime + loadingTime;
  }
  
  static findOptimalSources(stockout, facilities) {
    const sources = [];
    const { drugId, requiredQuantity, coordinates: destinationCoords } = stockout;
    
    // Check distributors first
    facilities.distributors.forEach(distributor => {
      const availableStock = distributor.stockLevels[drugId] || 0;
      if (availableStock >= requiredQuantity * 0.3) { // At least 30% of required
        const distance = this.calculateDistance(destinationCoords, distributor.coordinates);
        const eta = this.calculateETA(distance);
        
        sources.push({
          ...distributor,
          availableStock,
          distance: Math.round(distance * 10) / 10,
          eta: Math.round(eta * 10) / 10,
          priority: 1,
          canFulfill: Math.min(availableStock, requiredQuantity),
          cost: this.calculateCost(distance, Math.min(availableStock, requiredQuantity)),
          score: this.calculateScore(distance, availableStock, requiredQuantity, 1)
        });
      }
    });
    
    // Check manufacturers
    facilities.manufacturers.forEach(manufacturer => {
      const availableStock = manufacturer.stockLevels[drugId] || 0;
      if (availableStock >= requiredQuantity * 0.5) { // At least 50% of required
        const distance = this.calculateDistance(destinationCoords, manufacturer.coordinates);
        const eta = this.calculateETA(distance);
        
        sources.push({
          ...manufacturer,
          availableStock,
          distance: Math.round(distance * 10) / 10,
          eta: Math.round(eta * 10) / 10,
          priority: 2,
          canFulfill: Math.min(availableStock, requiredQuantity),
          cost: this.calculateCost(distance, Math.min(availableStock, requiredQuantity)),
          score: this.calculateScore(distance, availableStock, requiredQuantity, 2)
        });
      }
    });
    
    // Check nearby pharmacies/hospitals for peer transfers
    [...facilities.pharmacies, ...facilities.hospitals].forEach(facility => {
      if (facility.id === stockout.facilityId) return; // Skip self
      
      const availableStock = facility.stockLevels[drugId] || 0;
      const surplusStock = Math.max(0, availableStock - (facility.minimumStock[drugId] * 1.5));
      
      if (surplusStock >= requiredQuantity * 0.2) { // At least 20% of required
        const distance = this.calculateDistance(destinationCoords, facility.coordinates);
        const eta = this.calculateETA(distance, 'local');
        
        sources.push({
          ...facility,
          availableStock: surplusStock,
          distance: Math.round(distance * 10) / 10,
          eta: Math.round(eta * 10) / 10,
          priority: 3,
          canFulfill: Math.min(surplusStock, requiredQuantity),
          cost: this.calculateCost(distance, Math.min(surplusStock, requiredQuantity), 'local'),
          score: this.calculateScore(distance, surplusStock, requiredQuantity, 3)
        });
      }
    });
    
    // Sort by score (higher is better)
    return sources.sort((a, b) => b.score - a.score);
  }
  
  static calculateCost(distance, quantity, mode = 'standard') {
    const baseCosts = {
      standard: 2.5, // per mile
      local: 1.8,    // per mile for local transfers
      express: 4.0   // per mile for urgent deliveries
    };
    
    const baseCost = baseCosts[mode] || baseCosts.standard;
    const distanceCost = distance * baseCost;
    const quantityCost = quantity * 0.05; // $0.05 per unit
    const fixedCost = 50; // Base delivery fee
    
    return Math.round((distanceCost + quantityCost + fixedCost) * 100) / 100;
  }
  
  static calculateScore(distance, availableStock, requiredQuantity, priority) {
    // Higher score is better
    const distanceScore = Math.max(0, 100 - distance * 2); // Closer is better
    const stockScore = Math.min(100, (availableStock / requiredQuantity) * 50); // More stock is better
    const priorityScore = priority === 1 ? 100 : priority === 2 ? 80 : 60; // Distributors preferred
    const fulfillmentScore = (Math.min(availableStock, requiredQuantity) / requiredQuantity) * 100;
    
    return (distanceScore * 0.3 + stockScore * 0.2 + priorityScore * 0.3 + fulfillmentScore * 0.2);
  }
}

export { FACILITIES };
