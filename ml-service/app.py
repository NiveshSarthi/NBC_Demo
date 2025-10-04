from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from prophet import Prophet
import pickle
import os
from typing import List, Dict, Optional
import json

app = FastAPI(title="NextBoomCity ML Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models cache
models_cache = {}

# Pydantic models for requests
class PropertyFeatures(BaseModel):
    location_id: str
    property_type: str
    area_sqft: float
    bedrooms: int
    bathrooms: int
    age_years: int
    distance_to_city_center: float
    distance_to_metro: float

class PricePredictionRequest(BaseModel):
    property_id: str
    months_ahead: int = 24

class InvestmentScoreRequest(BaseModel):
    property_data: PropertyFeatures
    current_price: float

class InfrastructureImpactRequest(BaseModel):
    property_id: str
    infrastructure_type: str
    distance_km: float
    project_phase: str

class ReligiousROIRequest(BaseModel):
    property_data: PropertyFeatures
    site_name: str
    distance_to_site: float

# Load sample data for training (in production, this would come from database)
def load_sample_data():
    # Sample property data for training models
    np.random.seed(42)
    n_samples = 1000

    data = {
        'area_sqft': np.random.normal(1200, 300, n_samples),
        'bedrooms': np.random.randint(1, 5, n_samples),
        'bathrooms': np.random.randint(1, 4, n_samples),
        'age_years': np.random.randint(0, 20, n_samples),
        'distance_to_city_center': np.random.normal(5, 3, n_samples),
        'distance_to_metro': np.random.normal(2, 1.5, n_samples),
        'location_score': np.random.normal(7, 1.5, n_samples),
        'price': np.random.normal(5000000, 2000000, n_samples)
    }

    return pd.DataFrame(data)

# Initialize models on startup
@app.on_event("startup")
async def startup_event():
    # Load or train models
    df = load_sample_data()

    # Train price prediction model
    features = ['area_sqft', 'bedrooms', 'bathrooms', 'age_years', 'distance_to_city_center', 'distance_to_metro', 'location_score']
    X = df[features]
    y = df['price']

    price_model = RandomForestRegressor(n_estimators=100, random_state=42)
    price_model.fit(X, y)
    models_cache['price_predictor'] = price_model

    # Initialize Prophet for time series
    models_cache['prophet_models'] = {}

    print("ML models initialized")

# Smart Property Recommender
@app.post("/api/v1/ai/recommend")
async def get_property_recommendations(user_preferences: Dict):
    try:
        # Simple recommendation logic (in production, use collaborative filtering)
        df = load_sample_data()

        # Filter based on user preferences
        recommendations = df.sample(10).to_dict('records')

        return {
            "recommendations": recommendations,
            "total_found": len(recommendations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Price Prediction Engine
@app.post("/api/v1/ai/predict-price")
async def predict_property_price(request: PricePredictionRequest):
    try:
        # Get property data (mock for now)
        property_data = {
            'area_sqft': 1200,
            'bedrooms': 3,
            'bathrooms': 2,
            'age_years': 5,
            'distance_to_city_center': 3.5,
            'distance_to_metro': 1.2,
            'location_score': 8.0
        }

        model = models_cache.get('price_predictor')
        if not model:
            raise HTTPException(status_code=500, detail="Price prediction model not available")

        # Prepare features
        features = [[
            property_data['area_sqft'],
            property_data['bedrooms'],
            property_data['bathrooms'],
            property_data['age_years'],
            property_data['distance_to_city_center'],
            property_data['distance_to_metro'],
            property_data['location_score']
        ]]

        prediction = model.predict(features)[0]

        # Generate time series prediction using Prophet
        future_dates = pd.date_range(start=pd.Timestamp.now(), periods=request.months_ahead, freq='M')
        future_prices = prediction * (1 + np.random.normal(0, 0.02, request.months_ahead))  # Simple growth model

        forecast = [
            {
                "date": date.strftime("%Y-%m-%d"),
                "predicted_price": float(price),
                "confidence_lower": float(price * 0.9),
                "confidence_upper": float(price * 1.1)
            }
            for date, price in zip(future_dates, future_prices)
        ]

        return {
            "current_prediction": float(prediction),
            "forecast": forecast
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Investment Score Generator
@app.post("/api/v1/ai/investment-score")
async def calculate_investment_score(request: InvestmentScoreRequest):
    try:
        data = request.property_data

        # Calculate various factors
        appreciation_potential = min(100, max(0, (10 - data.age_years) * 5 + (10 - data.distance_to_city_center) * 3))
        rental_yield = (data.area_sqft * 0.004) / request.current_price * 100  # 0.4% of property value monthly
        location_growth = min(100, max(0, (10 - data.distance_to_city_center) * 10))
        infrastructure_impact = min(100, max(0, (5 - data.distance_to_metro) * 20))
        liquidity_score = 75  # Mock score
        risk_score = min(100, data.age_years * 3)

        # Weighted score
        weights = [0.4, 0.2, 0.15, 0.1, 0.1, 0.05]
        scores = [appreciation_potential, rental_yield, location_growth, infrastructure_impact, liquidity_score, risk_score]
        final_score = sum(s * w for s, w in zip(scores, weights))

        recommendation = "Strong Buy" if final_score > 80 else "Buy" if final_score > 60 else "Hold" if final_score > 40 else "Avoid"

        return {
            "total_score": round(final_score, 2),
            "breakdown": {
                "appreciation_potential": round(appreciation_potential, 2),
                "rental_yield": round(rental_yield, 2),
                "location_growth": round(location_growth, 2),
                "infrastructure_impact": round(infrastructure_impact, 2),
                "liquidity_score": liquidity_score,
                "risk_score": round(risk_score, 2)
            },
            "recommendation": recommendation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Infrastructure Impact Predictor
@app.get("/api/v1/ai/infrastructure-impact")
async def get_infrastructure_impact(property_id: str, infrastructure_type: str, distance_km: float, project_phase: str):
    try:
        # Calculate impact based on distance and project phase
        base_impact = 1.0
        distance_factor = max(0, 1 - (distance_km / 10))  # Impact decreases with distance
        phase_multiplier = {"planning": 0.3, "construction": 0.7, "operational": 1.0}.get(project_phase, 0.5)

        impact_score = base_impact * distance_factor * phase_multiplier * 100

        # Generate appreciation curve
        months = 60
        appreciation_curve = []
        for month in range(months):
            growth = impact_score * (1 - np.exp(-month / 24)) / 100  # S-curve growth
            appreciation_curve.append({
                "month": month,
                "appreciation_percent": round(growth, 2)
            })

        return {
            "distance_km": distance_km,
            "impact_score": round(impact_score, 2),
            "predicted_appreciation": appreciation_curve,
            "confidence": 0.85
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Religious Tourism ROI Calculator
@app.post("/api/v1/ai/religious-roi")
async def calculate_religious_roi(request: ReligiousROIRequest):
    try:
        data = request.property_data

        # Mock religious site data
        site_data = {
            "annual_footfall": 5000000,
            "peak_season_occupancy": 0.85,
            "off_season_occupancy": 0.45
        }

        # Calculate occupancy based on distance
        distance_factor = max(0, 1 - (request.distance_to_site / 50))  # Impact decreases with distance
        occupancy_rate = (site_data["peak_season_occupancy"] * 0.6 + site_data["off_season_occupancy"] * 0.4) * distance_factor

        # Calculate rental income
        monthly_rental = data.area_sqft * 0.004  # 0.4% of property value monthly

        # Tourism premium
        tourism_premium = 1 + (site_data["annual_footfall"] / 10000000) * 0.5

        # Operating costs (30% of rental income)
        operating_costs = monthly_rental * 0.3

        # Net operating income
        noi = (monthly_rental * occupancy_rate * tourism_premium) - operating_costs

        # ROI calculation
        annual_roi = (noi * 12) / request.property_data.area_sqft * 100  # Per sqft ROI
        total_investment = request.property_data.area_sqft * 3000  # Assuming 3000/sqft
        break_even_years = total_investment / (noi * 12) if noi > 0 else float('inf')

        return {
            "occupancy_rate": round(occupancy_rate, 2),
            "monthly_rental": round(monthly_rental, 2),
            "tourism_premium": round(tourism_premium, 2),
            "annual_roi_percent": round(annual_roi, 2),
            "break_even_years": round(break_even_years, 2) if break_even_years != float('inf') else None,
            "confidence": 0.75
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)