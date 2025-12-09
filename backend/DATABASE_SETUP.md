# Database Setup Guide

## Option 1: SQLite (Easiest - Recommended for Development)

SQLite is built into Python and requires no installation. The app is now configured to use SQLite by default.

### Setup Steps:

1. **No installation needed!** SQLite comes with Python.

2. **Run the app:**
   ```bash
   cd backend
   python run.py
   ```

3. **The database will be created automatically** as `ai_chat_history.db` in the `backend` directory.

4. **That's it!** You're ready to go.

### Migrations with SQLite:

```bash
cd backend
export FLASK_APP=run.py
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Option 2: PostgreSQL (Recommended for Production)

### Installation on macOS:

1. **Install PostgreSQL using Homebrew:**
   ```bash
   brew install postgresql@15
   ```

2. **Start PostgreSQL service:**
   ```bash
   brew services start postgresql@15
   ```

3. **Create the database:**
   ```bash
   createdb ai_chat_history
   ```

4. **Update `.env` file:**
   ```env
   DATABASE_URL=postgresql://your_username@localhost:5432/ai_chat_history
   ```
   
   Note: Replace `your_username` with your macOS username (run `whoami` to find it).

5. **Run migrations:**
   ```bash
   cd backend
   export FLASK_APP=run.py
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

### Alternative: Using PostgreSQL.app (GUI)

1. Download from: https://postgresapp.com/
2. Install and start the app
3. Click "Initialize" to create a new server
4. Use the connection string shown in the app

## Switching Between SQLite and PostgreSQL

### To use SQLite (default):
- Don't set `DATABASE_URL` in `.env`, or set it to:
  ```env
  DATABASE_URL=sqlite:///ai_chat_history.db
  ```

### To use PostgreSQL:
- Set `DATABASE_URL` in `.env`:
  ```env
  DATABASE_URL=postgresql://username@localhost:5432/ai_chat_history
  ```

## Troubleshooting

### SQLite Issues:
- If you get permission errors, check file permissions in the `backend` directory
- The database file is created automatically - no manual setup needed

### PostgreSQL Issues:

**"createdb: command not found"**
- PostgreSQL is not installed or not in PATH
- Install using: `brew install postgresql@15`
- Or use SQLite instead (no installation needed)

**"password authentication failed"**
- On macOS, PostgreSQL often uses peer authentication
- Use your macOS username in the connection string
- Or set a password: `psql postgres` then `ALTER USER your_username PASSWORD 'your_password';`

**"database does not exist"**
- Create it: `createdb ai_chat_history`
- Or use psql: `psql postgres` then `CREATE DATABASE ai_chat_history;`

## Recommendation

- **For Development**: Use SQLite (easiest, no setup)
- **For Production**: Use PostgreSQL (better performance, more features)


