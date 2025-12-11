# 🚀 Step-by-Step Startup Guide

## Complete Setup Instructions for the Adaptive Crypto Policy Engine

---

## Prerequisites Checklist

Before starting, ensure you have:
- ✅ Python 3.10 or higher installed
- ✅ Node.js 18+ and npm installed
- ✅ Git (optional, for version control)
- ✅ Code editor (VS Code recommended)

---

## Part 1: Backend Setup (Python + FastAPI)

### Step 1: Navigate to Backend Directory

```bash
cd d:\CS\adaptive-crypto-policy-engine\backend
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv
```

### Step 3: Activate Virtual Environment

```bash
# Activate (Windows)
venv\Scripts\activate

# You should see (venv) in your terminal prompt
```

### Step 4: Install Python Dependencies

```bash
# This may take 2-3 minutes
pip install -r requirements.txt
```

**Note:** If you see any errors about torch, that's okay - the updated requirements.txt should work.

### Step 5: Create and Configure .env File

```bash
# Copy the example file
copy .env.example .env
```

Now **EDIT the .env file** with a text editor:

**REQUIRED CHANGES:**

1. **Generate a SECRET_KEY** (IMPORTANT for security!):

```bash
# Run this command in your terminal:
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output (a long string of random characters).

2. **Open `.env` file** and replace the SECRET_KEY:

```env
# BEFORE (example):
SECRET_KEY=change-this-to-a-secure-random-secret-key-in-production

# AFTER (use your generated key):
SECRET_KEY=a7f3d9e1c2b4a8f6e3d1c9b7a5f8e2d4c1b9a7f5e3d1c9b7a5f8e2d4c1b9a7f5
```

**OPTIONAL CHANGES** (can leave as defaults):

```env
# Application
APP_NAME="Adaptive Crypto Policy Engine"
DEBUG=False  # Set to True only during development

# Database (SQLite is fine for development)
DATABASE_URL=sqlite:///./adaptive_crypto.db

# JWT Settings (defaults are good)
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Password Security
BCRYPT_ROUNDS=12

# Risk Scoring
RISK_LOW_THRESHOLD=30
RISK_MEDIUM_THRESHOLD=60
RISK_HIGH_THRESHOLD=61

# CORS Origins (add more if needed)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/app.log
```

### Step 6: Initialize Database

```bash
# This creates all tables and default users
python init_db.py
```

**Expected Output:**
```
Creating database tables...
Database tables created successfully
Seeding default encryption policies...
Default policies created successfully
Creating default admin user...
Admin user created successfully
  Username: admin
  Password: Admin@123
  ⚠️  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!
...
DATABASE INITIALIZATION COMPLETE
```

### Step 7: Start Backend Server

```bash
uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ **Backend is now running!**
- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

**Leave this terminal open and running.**

---

## Part 2: Frontend Setup (React + Vite)

### Step 1: Open New Terminal

**Important:** Open a NEW terminal window/tab (don't close the backend terminal!)

### Step 2: Navigate to Frontend Directory

```bash
cd d:\CS\adaptive-crypto-policy-engine\frontend
```

### Step 3: Install Node Dependencies

```bash
npm install
```

**Expected Output:**
```
added 500 packages, and audited 501 packages in 45s
...
found 0 vulnerabilities
```

**Note:** This may take 2-3 minutes depending on your internet speed.

### Step 4: Create and Configure .env File

```bash
# Copy the example file
copy .env.example .env
```

**Open `.env` file** and verify/edit:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8000
```

**ONLY CHANGE THIS IF:**
- Your backend is running on a different port
- You're deploying to production

For local development, **leave it as is**.

### Step 5: Start Frontend Development Server

```bash
npm run dev
```

**Expected Output:**
```
VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

✅ **Frontend is now running!**
- Application: http://localhost:5173

**Leave this terminal open and running.**

---

## Part 3: Access the Application

### Step 1: Open Your Browser

Go to: **http://localhost:5173**

### Step 2: Login with Default Credentials

Use any of these accounts:

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | Admin (recommended for testing) |
| manager1 | Manager@123 | Manager |
| user1 | User@123 | User |
| guest1 | Guest@123 | Guest |

### Step 3: Explore the Application

1. **Dashboard** - View statistics and charts
2. **Classification** - Classify data sensitivity
3. **Encryption** - Encrypt and decrypt data
4. **Policies** - View encryption policies
5. **Analytics** - View audit logs

---

## Quick Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'app'`
```bash
# Make sure you're in the backend directory and venv is activated
cd backend
venv\Scripts\activate
```

**Problem:** `SECRET_KEY` error
```bash
# Make sure you generated and set a SECRET_KEY in .env
python -c "import secrets; print(secrets.token_hex(32))"
# Copy output to .env file
```

**Problem:** Port 8000 already in use
```bash
# Stop other processes or use a different port
uvicorn app.main:app --reload --port 8001
# Then update frontend .env: VITE_API_BASE_URL=http://localhost:8001
```

### Frontend Issues

**Problem:** `npm install` fails
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Port 5173 already in use
```bash
# Vite will automatically try the next available port (5174, 5175, etc.)
# Just use the URL shown in the terminal
```

**Problem:** Cannot connect to backend (API errors)
```bash
# Verify backend is running on http://localhost:8000
# Check .env file: VITE_API_BASE_URL=http://localhost:8000
```

---

## Environment Variable Reference

### Backend .env (REQUIRED)

```env
# MUST CHANGE:
SECRET_KEY=<your-generated-secret-key>  # Generate with: python -c "import secrets; print(secrets.token_hex(32))"

# CAN KEEP DEFAULTS:
DATABASE_URL=sqlite:///./adaptive_crypto.db
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
BCRYPT_ROUNDS=12
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend .env (Usually No Changes Needed)

```env
# ONLY CHANGE if backend is on different port/host:
VITE_API_BASE_URL=http://localhost:8000
```

---

## Stopping the Application

### To Stop Backend:
1. Go to the backend terminal
2. Press `Ctrl + C`
3. Deactivate virtual environment: `deactivate`

### To Stop Frontend:
1. Go to the frontend terminal
2. Press `Ctrl + C`

---

## Restarting After Initial Setup

Once you've done the initial setup, starting is easier:

### Backend Terminal:
```bash
cd d:\CS\adaptive-crypto-policy-engine\backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

### Frontend Terminal (new terminal):
```bash
cd d:\CS\adaptive-crypto-policy-engine\frontend
npm run dev
```

---

## Production Deployment Checklist

If deploying to production, **MUST CHANGE**:

### Backend .env:
```env
DEBUG=False
SECRET_KEY=<strong-production-key>  # Generate new one!
DATABASE_URL=postgresql://...  # Use PostgreSQL
CORS_ORIGINS=https://yourdomain.com  # Your actual domain
```

### Security:
- [ ] Change all default passwords
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS/TLS
- [ ] Use production database (PostgreSQL)
- [ ] Set up proper logging
- [ ] Configure rate limiting
- [ ] Set up backup system

---

## Summary

1. **Backend**: `cd backend` → `venv\Scripts\activate` → `pip install -r requirements.txt` → Edit `.env` → `python init_db.py` → `uvicorn app.main:app --reload`
2. **Frontend**: New terminal → `cd frontend` → `npm install` → Edit `.env` → `npm run dev`
3. **Access**: Open http://localhost:5173 → Login with admin/Admin@123

**Both terminals must remain open while using the application!**

---

Need help? Check the main README.md or the walkthrough.md in the artifacts folder!
