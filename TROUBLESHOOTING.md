# Troubleshooting Guide

## ChatGPT Not Responding / Conversations Not Saving

### Step 1: Check Backend is Running

Make sure the Flask backend is running:
```bash
cd backend
python3 run.py
```

You should see:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://0.0.0.0:5001
```

### Step 2: Check API Key is Configured

1. Go to **Settings** in the app
2. Verify your OpenAI API key is saved
3. Make sure it's **Active** (green status)
4. The platform should be exactly **"openai"** (lowercase)

### Step 3: Check Browser Console

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Try sending a message
4. Look for any error messages

Common errors:
- `401 Unauthorized` - Authentication issue
- `400 Bad Request` - API key not configured
- `500 Internal Server Error` - Backend error

### Step 4: Check Backend Terminal

Look at the backend terminal for error messages. Common issues:

**"API key not configured for openai"**
- Solution: Add your API key in Settings

**"OpenAI authentication failed"**
- Solution: Check your API key is correct
- Make sure there are no extra spaces

**"No response from OpenAI"**
- Solution: Check your OpenAI account has credits
- Verify the API key has proper permissions

### Step 5: Test API Key Directly

Test your API key works:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

If this fails, your API key is invalid.

### Step 6: Check Database

Make sure the database is created:
```bash
cd backend
ls -la *.db
```

You should see `ai_chat_history.db`. If not, the app will create it automatically.

### Step 7: Verify Request is Being Sent

In browser DevTools:
1. Go to **Network** tab
2. Try sending a message
3. Look for request to `/api/chat/send`
4. Check:
   - Status code (should be 200)
   - Request payload (should have platform, model, message)
   - Response (should have conversation_id and message)

## Common Issues

### Issue: "Authentication required"
**Solution**: 
- Refresh the page and log in again
- Check that token is in localStorage: `localStorage.getItem('firebase_token')`

### Issue: "API key not configured"
**Solution**:
- Go to Settings → Add API Key
- Platform: **openai** (lowercase)
- Paste your OpenAI API key
- Click Save

### Issue: "Error calling OpenAI: ..."
**Solution**:
- Check your API key is valid
- Check you have credits in your OpenAI account
- Try a different model (e.g., gpt-3.5-turbo instead of gpt-4)

### Issue: Conversations not appearing
**Solution**:
- Check backend terminal for errors
- Verify database file exists
- Try refreshing the Conversations page
- Check browser console for errors

## Debug Mode

Enable detailed error messages:

1. Backend is already in debug mode (check `run.py`)
2. Check backend terminal for full error traces
3. Check browser console for detailed errors

## Still Not Working?

1. **Check all steps above**
2. **Restart both servers**:
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Restart both
3. **Clear browser cache** and refresh
4. **Check OpenAI account** has credits
5. **Try a simple test**: Send "Hello" and check console/terminal


