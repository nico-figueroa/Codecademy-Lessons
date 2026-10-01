import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Start MSW only in development
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser');
  await worker.start();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);