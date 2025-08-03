import pandas as pd
import numpy as np
from prophet import Prophet
import requests
from io import StringIO
import json
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class MedicineDemandForecaster:
    def __init__(self):
        self.data = None
        self.models = {}
        
    def load_data(self):
        """Load and preprocess the medicine demand dataset"""
        url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medicine_demand_forecast_sample-dT751x4F9LtOuT2Mp8C9juD4flEQLD.csv"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            csv_data = StringIO(response.text)
            df = pd.read_csv(csv_data)
            
            # Clean and preprocess data
            df['Date'] = pd.to_datetime(df['Date'])
            df['Demand'] = pd.to_numeric(df['Demand'], errors='coerce')
            
            # Remove any rows with missing values
            df = df.dropna()
            
            self.data = df
            print(f"Loaded {len(df)} records from {df['Date'].min()} to {df['Date'].max()}")
            return True
            
        except Exception as e:
            print(f"Error loading data: {e}")
            return False
    
    def prepare_prophet_data(self, medicine, region):
        """Prepare data for Prophet model training"""
        if self.data is None:
            return None
            
        # Filter data for specific medicine and region
        filtered_data = self.data[
            (self.data['Medicine'] == medicine) & 
            (self.data['Region'] == region)
        ].copy()
        
        if len(filtered_data) == 0:
            return None
            
        # Prepare Prophet format (ds, y)
        prophet_data = filtered_data[['Date', 'Demand']].copy()
        prophet_data.columns = ['ds', 'y']
        prophet_data = prophet_data.sort_values('ds').reset_index(drop=True)
        
        # Add region type as additional regressor
        region_type = filtered_data['Urban_Rural'].iloc[0]
        prophet_data['urban_rural'] = 1 if region_type == 'Urban' else 0
        
        return prophet_data, region_type
    
    def train_model(self, medicine, region):
        """Train Prophet model for specific medicine and region"""
        data, region_type = self.prepare_prophet_data(medicine, region)
        
        if data is None or len(data) < 10:  # Need minimum data points
            return None
            
        try:
            # Initialize Prophet model
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=False,
                daily_seasonality=False,
                seasonality_mode='multiplicative',
                changepoint_prior_scale=0.05
            )
            
            # Add urban/rural as regressor
            model.add_regressor('urban_rural')
            
            # Fit the model
            model.fit(data)
            
            # Store model
            model_key = f"{medicine}_{region}"
            self.models[model_key] = {
                'model': model,
                'region_type': region_type,
                'last_date': data['ds'].max(),
                'training_data': data
            }
            
            print(f"Model trained for {medicine} in {region} ({region_type})")
            return model
            
        except Exception as e:
            print(f"Error training model for {medicine} in {region}: {e}")
            return None
    
    def generate_forecast(self, medicine, region, periods=12):
        """Generate forecast for specific medicine and region"""
        model_key = f"{medicine}_{region}"
        
        if model_key not in self.models:
            # Train model if not exists
            model = self.train_model(medicine, region)
            if model is None:
                return None
        
        model_info = self.models[model_key]
        model = model_info['model']
        region_type = model_info['region_type']
        last_date = model_info['last_date']
        
        try:
            # Create future dataframe
            future = model.make_future_dataframe(periods=periods, freq='M')
            
            # Add urban/rural regressor for future dates
            future['urban_rural'] = 1 if region_type == 'Urban' else 0
            
            # Generate forecast
            forecast = model.predict(future)
            
            # Get only future predictions
            future_forecast = forecast.tail(periods)
            
            # Format results
            predictions = []
            for _, row in future_forecast.iterrows():
                predictions.append({
                    'month': row['ds'].strftime('%b'),
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'demand': max(0, int(row['yhat'])),  # Ensure non-negative
                    'lowerBound': max(0, int(row['yhat_lower'])),
                    'upperBound': max(0, int(row['yhat_upper'])),
                    'threshold': max(0, int(row['yhat'] * (1.5 if region_type == 'Rural' else 1.2)))
                })
            
            return {
                'predictions': predictions,
                'region_type': region_type.lower(),
                'model_performance': self.get_model_performance(model_key)
            }
            
        except Exception as e:
            print(f"Error generating forecast: {e}")
            return None
    
    def get_model_performance(self, model_key):
        """Calculate model performance metrics"""
        if model_key not in self.models:
            return None
            
        model_info = self.models[model_key]
        model = model_info['model']
        training_data = model_info['training_data']
        
        try:
            # Generate predictions for training data
            forecast = model.predict(training_data)
            
            # Calculate metrics
            actual = training_data['y'].values
            predicted = forecast['yhat'].values
            
            mae = np.mean(np.abs(actual - predicted))
            mape = np.mean(np.abs((actual - predicted) / actual)) * 100
            rmse = np.sqrt(np.mean((actual - predicted) ** 2))
            
            return {
                'mae': round(mae, 2),
                'mape': round(mape, 2),
                'rmse': round(rmse, 2),
                'accuracy': round(100 - mape, 2)
            }
            
        except Exception as e:
            print(f"Error calculating performance: {e}")
            return None
    
    def get_historical_data(self, medicine, region):
        """Get historical actual vs predicted data"""
        model_key = f"{medicine}_{region}"
        
        if model_key not in self.models:
            return None
            
        model_info = self.models[model_key]
        model = model_info['model']
        training_data = model_info['training_data']
        
        try:
            # Generate predictions for historical data
            forecast = model.predict(training_data)
            
            # Combine actual and predicted
            historical = []
            for i, (_, row) in enumerate(training_data.iterrows()):
                historical.append({
                    'month': row['ds'].strftime('%b'),
                    'actual': int(row['y']),
                    'predicted': max(0, int(forecast.iloc[i]['yhat']))
                })
            
            return historical[-12:]  # Return last 12 months
            
        except Exception as e:
            print(f"Error getting historical data: {e}")
            return None
    
    def get_seasonal_patterns(self, medicine, region):
        """Analyze seasonal demand patterns"""
        if self.data is None:
            return None
            
        filtered_data = self.data[
            (self.data['Medicine'] == medicine) & 
            (self.data['Region'] == region)
        ].copy()
        
        if len(filtered_data) == 0:
            return None
            
        try:
            # Add season column
            filtered_data['Month'] = filtered_data['Date'].dt.month
            
            def get_season(month):
                if month in [12, 1, 2]:
                    return 'Winter'
                elif month in [3, 4, 5]:
                    return 'Summer'
                elif month in [6, 7, 8, 9]:
                    return 'Monsoon'
                else:
                    return 'Post-Monsoon'
            
            filtered_data['Season'] = filtered_data['Month'].apply(get_season)
            
            # Calculate seasonal averages
            seasonal_data = filtered_data.groupby('Season')['Demand'].mean().round().astype(int)
            
            seasons = ['Winter', 'Summer', 'Monsoon', 'Post-Monsoon']
            colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6']
            
            seasonal_patterns = []
            for i, season in enumerate(seasons):
                if season in seasonal_data.index:
                    seasonal_patterns.append({
                        'name': season,
                        'value': int(seasonal_data[season]),
                        'color': colors[i]
                    })
            
            return seasonal_patterns
            
        except Exception as e:
            print(f"Error analyzing seasonal patterns: {e}")
            return None

# Test the forecaster
if __name__ == "__main__":
    forecaster = MedicineDemandForecaster()
    
    if forecaster.load_data():
        # Test with first available medicine and region
        medicines = forecaster.data['Medicine'].unique()
        regions = forecaster.data['Region'].unique()
        
        test_medicine = medicines[0]
        test_region = regions[0]
        
        print(f"\nTesting forecast for {test_medicine} in {test_region}")
        
        # Generate forecast
        forecast_result = forecaster.generate_forecast(test_medicine, test_region, periods=12)
        
        if forecast_result:
            print("Forecast generated successfully!")
            print(f"Region type: {forecast_result['region_type']}")
            print("Sample predictions:")
            for pred in forecast_result['predictions'][:3]:
                print(f"  {pred['month']}: {pred['demand']} units")
        
        # Test historical data
        historical = forecaster.get_historical_data(test_medicine, test_region)
        if historical:
            print(f"\nHistorical data points: {len(historical)}")
        
        # Test seasonal patterns
        seasonal = forecaster.get_seasonal_patterns(test_medicine, test_region)
        if seasonal:
            print(f"\nSeasonal patterns:")
            for season in seasonal:
                print(f"  {season['name']}: {season['value']} units")
