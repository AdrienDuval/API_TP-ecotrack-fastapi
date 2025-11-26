# Quick Start Guide - Display Data on Frontend

Your database already has **7,218 indicators**! Follow these steps to display them on the frontend.

## ✅ Step 1: Verify Data is in Database

```powershell
cd "C:\Users\Adrien Duval\Documents\Efrei\API\API_TP-ecotrack-fastapi"
python check_data.py
```

**Expected output**: Should show 7,218+ indicators

---

## 🚀 Step 2: Start FastAPI Server

Open a **new terminal window** and run:

```powershell
cd "C:\Users\Adrien Duval\Documents\Efrei\API\API_TP-ecotrack-fastapi"
python -m uvicorn app.main:app --reload
```

**Keep this terminal open!** The server must be running.

**Verify it's working**: Open http://localhost:8000/docs in your browser
- You should see the Swagger UI
- This confirms the API is running

---

## 🧪 Step 3: Test API (Optional)

In a **new terminal**, test if API works:

```powershell
cd "C:\Users\Adrien Duval\Documents\Efrei\API\API_TP-ecotrack-fastapi"
python test_api.py
```

This will:
- Test if API is accessible
- Try to login
- Fetch sample data
- Show you what's working

---

## 🎨 Step 4: Start Frontend

Open a **new terminal window** and run:

```powershell
cd "C:\Users\Adrien Duval\Documents\Efrei\API\API_TP-ecotrack-fastapi\frontend"
npm run dev
```

**Keep this terminal open too!**

**Verify**: Open http://localhost:5173 in your browser
- You should see the login page

---

## 🔐 Step 5: Login to Frontend

**Use your admin credentials:**
- Username: `admin` (or whatever you created)
- Password: `password123` (or whatever you set)

**If you don't remember your credentials:**
1. Check what users exist:
   ```powershell
   python check_data.py
   ```
2. Or create a new admin:
   ```powershell
   python create_admin_quick.py admin admin@example.com password123
   ```

---

## 📊 Step 6: View Data on Dashboard

After logging in:

1. **Dashboard Page** - Should show:
   - Summary statistics (counts, averages)
   - Charts with CO2 trends
   - Indicator cards

2. **Data Management Page** (Admin only) - Should show:
   - List of all indicators
   - Filter options
   - Delete buttons

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to API" on frontend

**Check:**
1. Is FastAPI server running? (Step 2)
2. Can you access http://localhost:8000/docs?
3. Check browser console (F12) for errors

**Fix:**
- Make sure server is running on port 8000
- Check if firewall is blocking connections

### Problem: "401 Unauthorized" errors

**Check:**
1. Are you logged in on frontend?
2. Is the token stored? (Check browser DevTools > Application > Local Storage)
3. Try logging out and logging back in

**Fix:**
- Clear browser cache/localStorage
- Login again
- Check if token is being sent in requests (Network tab)

### Problem: "No data showing" but database has data

**Check:**
1. Run `python check_data.py` - confirms data exists
2. Run `python test_api.py` - confirms API works
3. Check browser Network tab - are API calls successful?

**Fix:**
- Make sure you're logged in
- Check API responses in Network tab
- Verify API server is running

### Problem: "Empty dashboard" or "Loading forever"

**Check browser console (F12):**
- Look for JavaScript errors
- Look for failed API calls
- Check Network tab for 401/500 errors

**Common issues:**
- Not logged in → Login first
- API server not running → Start server (Step 2)
- Wrong API URL → Check `frontend/src/api/axios.js` has `http://localhost:8000`

---

## 📋 Quick Checklist

Before viewing data, make sure:

- [ ] Database has data (`python check_data.py` shows indicators)
- [ ] FastAPI server is running (`http://localhost:8000/docs` works)
- [ ] Frontend is running (`http://localhost:5173` loads)
- [ ] You're logged in on frontend
- [ ] Browser console shows no errors

---

## 🎯 Expected Results

After completing all steps, you should see:

**Dashboard:**
- 4+ stat cards (air quality, energy, CO2, etc.)
- Chart showing CO2 trends
- Numbers and graphs with real data

**Data Management:**
- Table with 100+ indicators
- Filter dropdowns working
- Data from Paris, Lyon, Marseille, etc.

---

## 💡 Pro Tips

1. **Keep terminals open**: You need both API and frontend servers running
2. **Use browser DevTools**: F12 to see what's happening
3. **Check Network tab**: See if API calls are successful
4. **Test API directly**: Use http://localhost:8000/docs to test endpoints
5. **Add more data**: Run `python ingestion/mock_data_ingestion.py --days 60` for more data

---

## 🆘 Still Having Issues?

1. **Check data exists**: `python check_data.py`
2. **Test API**: `python test_api.py` (while server is running)
3. **Check server logs**: Look at the FastAPI terminal for errors
4. **Check frontend logs**: Look at the npm terminal for errors
5. **Browser console**: F12 > Console tab for JavaScript errors

---

**You have 7,218 indicators ready to display!** 🎉


