import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './LanguageContext';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { SettingsProvider } from './lib/SettingsContext';
import { CurrencyProvider } from './lib/CurrencyContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </CurrencyProvider>
        </LanguageProvider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
);

