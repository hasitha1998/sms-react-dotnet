// ============================================================
// src/main.jsx — React entry point
// This is the first file React runs
// It mounts the <App /> component into the HTML #root div
// ============================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ReactDOM.createRoot finds the #root div in index.html
// and renders the entire React app inside it
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode helps catch bugs during development
  // It renders components twice in dev to detect side effects
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
