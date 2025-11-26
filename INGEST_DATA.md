# Data Ingestion Guide - Quick Start

This guide will help you collect data and fill your database so you can display it on the frontend.

## 🚀 Quick Start (Easiest Method)

### Step 1: Run Mock Data Ingestion (No API keys needed!)

```powershell
cd "C:\Users\Adrien Duval\Documents\Efrei\API\API_TP-ecotrack-fastapi"
python ingestion/mock_data_ingestion.py --days 30
```

This will create:
- ✅ 5 cities (zones): Paris, Lyon, Marseille, Toulouse, Nice
- ✅ 3 data sources
- ✅ ~6,300 indicators (air quality, energy, CO2)
- ✅ 30 days of historical data

**Time**: ~30 seconds

---

## 📊 What Data Gets Created?

### Zones (Cities)
- Paris (75000)
- Lyon (69000)
- Marseille (13000)
- Toulouse (31000)
- Nice (06000)

### Indicator Types
1. **Air Quality** (`air_quality`)
   - PM2.5, PM10, O3, NO2, SO2
   - Every 3 hours for 30 days
   - ~6,000 indicators

2. **Energy Consumption** (`energy`)
   - Daily kWh usage
   - ~150 indicators

3. **CO2 Emissions** (`co2`)
   - Daily kg emissions
   - ~150 indicators

---

## 🔍 Verify Data is in Database

After running ingestion, verify with:

```powershell
python check_data.py
```

This will show you:
- How many indicators are in the database
- How many zones
- How many sources
- Sample data

---

## 🌐 Test API Endpoints

### 1. Start your FastAPI server:
```powershell
python -m uvicorn app.main:app --reload
```

### 2. Test in browser or Postman:

**Get all indicators:**
```
http://localhost:8000/indicators/?limit=10
```

**Get summary stats:**
```
http://localhost:8000/stats/summary
```

**Get air quality averages:**
```
http://localhost:8000/stats/air/averages
```

**Get CO2 trends:**
```
http://localhost:8000/stats/co2/trend?period=monthly
```

---

## 🎨 Display on Frontend

Once data is in the database:

1. **Start Frontend:**
   ```powershell
   cd frontend
   npm run dev
   ```

2. **Login** with your admin account

3. **View Dashboard** - Should show:
   - Summary statistics
   - Charts with data
   - Indicator counts

4. **View Data Management** (Admin only):
   - List of all indicators
   - Filter by type/zone
   - Delete indicators

---

## 🐛 Troubleshooting

### Problem: "No data showing on frontend"

**Solution 1: Check if data exists**
```powershell
python check_data.py
```

**Solution 2: Check API is working**
- Open: http://localhost:8000/docs
- Try: `GET /indicators/`
- Should return a list of indicators

**Solution 3: Check frontend API calls**
- Open browser DevTools (F12)
- Go to Network tab
- Check if API calls are successful
- Look for 401 errors (authentication issue)

### Problem: "Ingestion script fails"

**Check:**
1. Database exists: `ecotrack.db` should be in project root
2. FastAPI server was started at least once (creates tables)
3. You're in the correct directory

**Fix:**
```powershell
# Make sure you're in the right directory
cd "C:\Users\Adrien Duval\Documents\Efrei\API\API_TP-ecotrack-fastapi"

# Start server once to create tables
python -m uvicorn app.main:app --reload
# (Press Ctrl+C to stop after tables are created)

# Then run ingestion
python ingestion/mock_data_ingestion.py --days 30
```

---

## 📈 Alternative: Real Weather Data

If you want real weather data (no API key needed):

```powershell
python ingestion/openmeteo_ingestion.py
```

This fetches:
- Temperature data
- Precipitation data
- For Paris, Lyon, Marseille, Toulouse
- Last 7 days of historical data

---

## 🔄 Run All Ingestion Scripts

To run everything at once:

```powershell
python ingestion/run_all_ingestion.py
```

This will:
1. Run Open-Meteo (weather data)
2. Run OpenAQ (if API key is set)
3. Show summary

---

## ✅ Success Checklist

After running ingestion, you should have:

- [ ] `ecotrack.db` file exists and has data
- [ ] Can access `/indicators/` endpoint
- [ ] Can access `/stats/summary` endpoint
- [ ] Frontend dashboard shows data
- [ ] At least 100+ indicators in database

---

## 📞 Need Help?

1. Check `check_data.py` output
2. Check API at http://localhost:8000/docs
3. Check browser console for errors
4. Verify you're logged in on frontend


