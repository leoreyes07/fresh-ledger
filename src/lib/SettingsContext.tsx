import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface SettingRow {
  key: string;
  value: any;
}

interface SettingsContextType {
  settings: Record<string, any>;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  updateSetting: (key: string, value: any) => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('settings')
        .select('key, value');

      if (sbError) throw sbError;

      const settingsMap = (data || []).reduce((acc: Record<string, any>, curr: SettingRow) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      setSettings(settingsMap);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error: updateError } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (updateError) throw updateError;
      
      // Actualizar el estado local
      setSettings(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (err) {
      console.error('Error updating setting:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings: fetchSettings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
