// Firebase configuration
// Replace with your Firebase config
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "your-app-id"
};

// For development/testing without Firebase, you can use a mock token
export const getMockToken = () => {
  // This is just for development - in production, use Firebase Auth
  return localStorage.getItem('mock_token') || null;
};

export const setMockToken = (token) => {
  localStorage.setItem('mock_token', token);
  localStorage.setItem('firebase_token', token);
};


