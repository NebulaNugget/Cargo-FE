import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize stores
import './stores/authStore'
import './stores/uiStore'
import './stores/queryStore'
import './stores/logStore'
import './stores/dashboardStore'
import './stores/userStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)