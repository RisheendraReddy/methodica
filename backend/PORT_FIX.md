# Port 5000 Conflict Fix

## Problem
Port 5000 is often used by macOS AirPlay Receiver, causing conflicts when running Flask.

## Solution
The app now defaults to port **5001** instead of 5000.

## Running the App

```bash
cd backend
python3 run.py
```

The server will start on `http://localhost:5001`

## Frontend Configuration

The React app is configured to proxy requests to port 5001. If you need to change the port:

1. **Backend**: Set `PORT` environment variable:
   ```bash
   PORT=5002 python3 run.py
   ```

2. **Frontend**: Update `client/package.json`:
   ```json
   "proxy": "http://localhost:5002"
   ```

## Alternative: Disable AirPlay Receiver

If you prefer to use port 5000:

1. Go to **System Preferences** → **General** → **AirDrop & Handoff**
2. Disable **AirPlay Receiver**
3. Restart your Mac
4. Change the default port back to 5000 in `run.py` and `app.py`


