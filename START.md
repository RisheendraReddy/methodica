# Quick Start Guide

## Starting the Application

### Terminal 1 - Backend Server

```bash
cd "/Users/risheendrareddyboddu/Desktop/untitled folder 8/backend"
python3 run.py
```

The backend will start on `http://localhost:5001`

### Terminal 2 - Frontend Server

```bash
cd "/Users/risheendrareddyboddu/Desktop/untitled folder 8/client"
npm start
```

The frontend will start on `http://localhost:3000`

## Quick Commands

### From Project Root

**Backend:**
```bash
cd backend && python3 run.py
```

**Frontend:**
```bash
cd client && npm start
```

### From Backend Directory

**To start backend:**
```bash
python3 run.py
```

**To start frontend (from backend dir):**
```bash
cd ../client && npm start
```

### From Client Directory

**To start frontend:**
```bash
npm start
```

**To start backend (from client dir):**
```bash
cd ../backend && python3 run.py
```

## First Time Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 run.py
```

### Frontend
```bash
cd client
npm install
npm start
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Health Check**: http://localhost:5001/api/health

## Troubleshooting

**Port 5001 already in use?**
- Change port: `PORT=5002 python3 run.py`
- Update proxy in `client/package.json`

**Port 3000 already in use?**
- React will automatically use the next available port (3001, 3002, etc.)

**Module not found errors?**
- Backend: Make sure virtual environment is activated and dependencies installed
- Frontend: Run `npm install` in the client directory


