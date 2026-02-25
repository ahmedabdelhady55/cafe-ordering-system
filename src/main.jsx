import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1C1917',
          color: '#FAF8F5',
          borderRadius: '12px',
        },
        success: {
          iconTheme: {
            primary: '#D97706',
            secondary: '#FAF8F5',
          },
        },
      }}
    />
  </React.StrictMode>,
)