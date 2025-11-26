# Data Ingestion Scripts

This directory contains scripts to populate the EcoTrack database with environmental data from various sources.

## Available Scripts

### 1. Mock Data Ingestion (Recommended for Testing)
**File**: `mock_data_ingestion.py`

Generates realistic mock data for testing without requiring API keys.

```bash
# Generate 30 days of mock data (default)
python ingestion/mock_data_ingestion.py

# Generate 90 days of mock data
python ingestion/mock_data_ingestion.py --days 90
```

**Data Generated**:
- Air quality indicators (PM2.5, PM10, O3, NO2, SO2)
- Energy consumption data
- CO2 emissions data
- For 5 French cities: Paris, Lyon, Marseille, Toulouse, Nice

---

### 2. OpenAQ Air Quality Data
**File**: `openaq_ingestion.py`

Fetches real air quality data from OpenAQ API.

**Setup**:
1. Sign up for a free API key at: https://explore.openaq.org/
2. Set environment variable:
   ```bash
   # Windows PowerShell
   $env:OPENAQ_API_KEY="your_api_key_here"
   
   # Linux/Mac
   export OPENAQ_API_KEY="your_api_key_here"
   ```

**Usage**:
```bash
python ingestion/openaq_ingestion.py
```

**Data Source**:
- **API**: OpenAQ v3
- **Coverage**: Global (France included)
- **Frequency**: Hourly updates
- **Parameters**: PM2.5, PM10, O3, NO2, SO2, CO
- **Limitations**: Rate limited to 10 requests/second

---

### 3. Open-Meteo Weather Data
**File**: `openmeteo_ingestion.py`

Fetches historical weather data (no API key required!).

**Usage**:
```bash
python ingestion/openmeteo_ingestion.py
```

**Data Source**:
- **API**: Open-Meteo Archive API
- **Coverage**: Global, 80 years of historical data
- **Frequency**: Hourly resolution
- **Parameters**: Temperature, humidity, precipitation, wind speed
- **Limitations**: Fair use policy (no hard limits)
- **Cost**: FREE, no API key needed!

---

## Data Sources Documentation

### OpenAQ
- **Website**: https://openaq.org
- **API Docs**: https://docs.openaq.org/
- **Data Quality**: Government monitoring stations
- **Update Frequency**: Real-time to hourly
- **API Key**: Required (free)

### Open-Meteo
- **Website**: https://open-meteo.com
- **API Docs**: https://open-meteo.com/en/docs
- **Data Quality**: ERA5 reanalysis models
- **Update Frequency**: Hourly
- **API Key**: Not required

### ADEME Base Carbone (Future)
- **Website**: https://data.ademe.fr
- **API Docs**: https://api.gouv.fr/les-api/api-base-carbone
- **Data Quality**: Official French government data
- **Content**: CO2 emission factors
- **API Key**: Required (free)

---

## Running All Ingestion Scripts

Create a master script to run all ingestions:

```bash
# Run mock data first (for testing)
python ingestion/mock_data_ingestion.py --days 30

# Then run real data sources (if API keys are configured)
python ingestion/openmeteo_ingestion.py
python ingestion/openaq_ingestion.py
```

---

## Scheduling Automatic Ingestion

### Using Windows Task Scheduler
1. Create a batch file `run_ingestion.bat`:
   ```batch
   cd "C:\Users\Adrien Duval\Documents\Efrei\API\API_TP-ecotrack-fastapi"
   python ingestion/openmeteo_ingestion.py
   python ingestion/openaq_ingestion.py
   ```

2. Schedule it to run daily

### Using Cron (Linux/Mac)
```bash
# Add to crontab (run daily at 2 AM)
0 2 * * * cd /path/to/project && python ingestion/openmeteo_ingestion.py
0 2 * * * cd /path/to/project && python ingestion/openaq_ingestion.py
```

---

## Troubleshooting

### "No module named 'app'"
Make sure you're running from the project root directory:
```bash
cd "C:\Users\Adrien Duval\Documents\Efrei\API\API_TP-ecotrack-fastapi"
python ingestion/script_name.py
```

### API Key Errors
- Check environment variable is set: `echo $env:OPENAQ_API_KEY`
- Verify API key is valid
- Check API rate limits

### Database Errors
- Ensure the FastAPI server has been run at least once (creates the database)
- Check database file exists: `ecotrack.db`

---

## Next Steps

1. **Start with mock data** to test your API
2. **Get API keys** for real data sources
3. **Schedule regular ingestion** for fresh data
4. **Monitor data quality** and handle errors
