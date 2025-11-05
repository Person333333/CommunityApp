import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

// Hardcode the key temporarily to bypass the environment variable issue
const PUBLISHABLE_KEY = "pk_test_aW1tb3J0YWwtamFja2FsLTExLmNsZXJrLmFjY291bnRzLmRldiQ"
// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

console.log('Environment variables:', import.meta.env);
console.log('PUBLISHABLE_KEY:', PUBLISHABLE_KEY);

if (!PUBLISHABLE_KEY) {
  console.error("Missing Publishable Key - VITE_CLERK_PUBLISHABLE_KEY not found");
  // Let's render a simple error message instead of throwing
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#fee2e2', 
      border: '1px solid #ef4444',
      borderRadius: '8px',
      margin: '2rem',
      color: '#dc2626'
    }}>
      <h2>Configuration Error</h2>
      <p>Missing VITE_CLERK_PUBLISHABLE_KEY environment variable.</p>
      <p>Please check your .dev.vars file.</p>
      <details>
        <summary>Environment Debug Info</summary>
        <pre>{JSON.stringify(import.meta.env, null, 2)}</pre>
      </details>
    </div>
  );
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY} 
        afterSignOutUrl="/"
        afterSignInUrl="/"
        afterSignUpUrl="/"
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>,
  )
}
