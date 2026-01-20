import React from 'react';
import ReactDOM from 'react-dom/client';
import App, { SotaErrorBoundary } from './App';
import './index.css';

// Suppress console errors in production
if (import.meta.env.PROD) {
  console.error = () => {};
  console.warn = () => {};
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <SotaErrorBoundary>
      <App />
    </SotaErrorBoundary>
  </React.StrictMode>
);

