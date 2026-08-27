import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import './index.css';

function AppToaster() {
  const { isRtl } = useLanguage();
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          direction: isRtl ? 'rtl' : 'ltr',
          fontFamily: 'Cairo, Tajawal, system-ui, sans-serif',
          fontSize: '0.95rem',
          borderRadius: '12px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#16A34A', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#DC2626', secondary: '#fff' },
          duration: 5000,
        },
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              <App />
              <AppToaster />
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
