import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Register PWA Service Worker
registerSW({
  onOfflineReady() {
    console.log('App is ready for offline use');
  },
  onNeedRefresh() {
    console.log('New content available, please refresh.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <SpeedInsights />
  </StrictMode>,
);
