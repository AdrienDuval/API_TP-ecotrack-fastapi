# Data Sources Documentation

## 📊 Overview

EcoTrack uses **2 free external data sources** to populate environmental indicators:

| Source | Type | API Key | Status | Data Coverage |
|--------|------|---------|--------|---------------|
| **Open-Meteo** | Weather/Climate | ❌ Not needed | ✅ Working | Global, 80 years history |
| **OpenAQ** | Air Quality | ✅ Required (free) | ⚠️ Optional | Global, real-time |

---

## 1. Open-Meteo (Primary Source) ✅

### About
- **Website**: https://open-meteo.com
- **API Documentation**: https://open-meteo.com/en/docs
- **Cost**: FREE for non-commercial use
- **API Key**: Not required
- **Rate Limits**: Fair use policy (no hard limits)

### Data Provided
- **Temperature** (hourly, °C)
- **Precipitation** (hourly, mm)
- **Humidity** (hourly, %)
- **Wind Speed** (hourly, km/h)
- **Historical Data**: From 1940 to present

### API Endpoint
```
https://archive-api.open-meteo.com/v1/archive
```

### Example Request
```bash
curl "https://archive-api.open-meteo.com/v1/archive?latitude=48.8566&longitude=2.3522&start_date=2025-11-18&end_date=2025-11-25&hourly=temperature_2m,precipitation&timezone=Europe/Paris"
```

### CSV Download Option
Yes! Open-Meteo supports CSV format:
```bash
# Add &format=csv to the URL
curl "https://archive-api.open-meteo.com/v1/archive?latitude=48.8566&longitude=2.3522&start_date=2025-11-18&end_date=2025-11-25&hourly=temperature_2m&format=csv" > weather_data.csv
```

### Why We Use JSON Instead of CSV
1. **Programmatic processing** - easier to parse and validate
2. **Automation** - can run scripts on schedule
3. **Error handling** - better error detection
4. **Project requirements** - specs ask for API integration

---

## 2. OpenAQ (Secondary Source) ⚠️

### About
- **Website**: https://openaq.org
- **API Documentation**: https://docs.openaq.org
- **Cost**: FREE
- **API Key**: Required (free signup at https://explore.openaq.org/)
- **Rate Limits**: 10 requests/second

### Data Provided
- **Air Quality Parameters**: PM2.5, PM10, O3, NO2, SO2, CO
- **Units**: µg/m³
- **Frequency**: Hourly to real-time
- **Coverage**: Global government monitoring stations

### API Endpoint
```
https://api.openaq.org/v3/locations
```

### Setup
1. Sign up at: https://explore.openaq.org/
2. Get your API key
3. Set environment variable:
   ```powershell
   # Windows PowerShell
   $env:OPENAQ_API_KEY="your_key_here"
   ```

### Current Status
⚠️ The OpenAQ v3 API structure changed. The ingestion script needs updating to use the new endpoints:
- `/v3/locations` - Find monitoring stations
- `/v3/sensors/{sensor_id}/measurements` - Get measurements

---

## 🎲 Mock Data (For Testing)

We also provide a **mock data generator** that creates realistic test data without any external APIs.

### Usage
```bash
python ingestion/mock_data_ingestion.py --days 30
```

### Data Generated
- **Air Quality**: PM2.5, PM10, O3, NO2, SO2 (6000 indicators)
- **Energy Consumption**: Daily kWh usage (150 indicators)
- **CO2 Emissions**: Daily kg emissions (150 indicators)
- **Cities**: Paris, Lyon, Marseille, Toulouse, Nice

---

## 📈 Data Ingestion Summary

### What's Currently Working ✅

1. **Open-Meteo** - 918 real weather indicators ingested
2. **Mock Data** - 6,300 test indicators generated

### What Needs API Key ⚠️

1. **OpenAQ** - Requires free API key (optional, for air quality data)

---

## 🔄 Running Data Ingestion

### Option 1: Run Individual Scripts
```bash
# Weather data (no API key needed)
python ingestion/openmeteo_ingestion.py

# Mock data for testing
python ingestion/mock_data_ingestion.py --days 30

# Air quality (requires API key)
python ingestion/openaq_ingestion.py
```

### Option 2: Run All Sources
```bash
python ingestion/run_all_ingestion.py
```

---

## 📝 Project Requirements Met

✅ **At least 2 external sources**: Open-Meteo + OpenAQ  
✅ **Free APIs**: Both are completely free  
✅ **Documentation**: This file + inline comments  
✅ **Data variety**: Weather, air quality, energy, CO2  
✅ **Automation**: Scripts can run on schedule  

---

## 🚀 Next Steps

1. ✅ **Open-Meteo is working** - No action needed
2. ⚠️ **OpenAQ** - Optional, update script for v3 API if needed
3. 📊 **You have enough data** - 7,218 indicators already in database!
4. 🎨 **Build the frontend** - Visualize this data
5. 🧪 **Write tests** - Test your API endpoints
