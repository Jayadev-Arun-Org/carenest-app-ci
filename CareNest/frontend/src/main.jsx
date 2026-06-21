import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'
import './index.css'

// ─── Entra ID / MSAL — TEMPORARILY DISABLED ──────────────────
// MSAL requires HTTPS. Currently running on HTTP.
// To re-enable Entra ID, uncomment the block below
// and ensure the app is served over HTTPS.
//
// import { PublicClientApplication } from '@azure/msal-browser'
// import { MsalProvider } from '@azure/msal-react'
// import { msalConfig } from './auth/msalConfig.js'
//
// const msalInstance = new PublicClientApplication(msalConfig)
// await msalInstance.initialize()
//
// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <MsalProvider instance={msalInstance}>
//           <App />
//         </MsalProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// )
// ─────────────────────────────────────────────────────────────

// JWT mode — works on HTTP
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
