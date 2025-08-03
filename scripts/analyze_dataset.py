import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
import requests
from io import StringIO

# Fetch and analyze the dataset
def analyze_medicine_dataset():
    # Fetch the dataset
    url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medicine_demand_forecast_sample-dT751x4F9LtOuT2Mp8C9juD4flEQLD.csv"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Read CSV data
        csv_data = StringIO(response.text)
        df = pd.read_csv(csv_data)
        
        print("Dataset Analysis:")
        print("=" * 50)
        print(f"Dataset shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")
        print("\nFirst 5 rows:")
        print(df.head())
        
        print("\nData types:")
        print(df.dtypes)
        
        print("\nUnique values per column:")
        for col in df.columns:
            print(f"{col}: {df[col].nunique()} unique values")
            if df[col].nunique() < 20:
                print(f"  Values: {df[col].unique()}")
        
        print("\nMissing values:")
        print(df.isnull().sum())
        
        # Convert Date column to datetime
        df['Date'] = pd.to_datetime(df['Date'])
        
        print(f"\nDate range: {df['Date'].min()} to {df['Date'].max()}")
        
        # Analyze demand patterns
        print("\nDemand statistics:")
        print(df['Demand'].describe())
        
        # Group by medicine and region
        print("\nMedicines in dataset:")
        medicines = df['Medicine'].unique()
        for med in medicines:
            med_data = df[df['Medicine'] == med]
            print(f"  {med}: {len(med_data)} records")
        
        print("\nRegions in dataset:")
        regions = df['Region'].unique()
        for region in regions:
            region_data = df[df['Region'] == region]
            urban_rural = region_data['Urban_Rural'].unique()
            print(f"  {region}: {len(region_data)} records ({', '.join(urban_rural)})")
        
        # Sample data for Prophet format
        print("\nSample data for Prophet (first medicine/region combination):")
        sample = df[(df['Medicine'] == medicines[0]) & (df['Region'] == regions[0])].copy()
        sample = sample.rename(columns={'Date': 'ds', 'Demand': 'y'})
        sample = sample[['ds', 'y']].sort_values('ds')
        print(sample.head(10))
        
        return df
        
    except Exception as e:
        print(f"Error fetching or analyzing dataset: {e}")
        return None

# Run the analysis
if __name__ == "__main__":
    df = analyze_medicine_dataset()
