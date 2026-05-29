import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: '#12121a',
          color: '#e0e0e0',
          border: '1px solid #00d4ff',
          fontFamily: "'Share Tech Mono', monospace",
        },
      }}
    />
    <App />
  </StrictMode>,
)
