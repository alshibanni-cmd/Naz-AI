'use client';

import React, { createContext, useContext, ReactNode, useReducer, useEffect, useCallback } from 'react';
import { Settings, SettingsState, DEFAULT_SETTINGS } from '@/types/settings.types';
import { settingsReducer, initialSettingsState, SettingsActions } from '@/reducers/settingsReducer';
import { settingsService } from '@/services/settingsService';

interface SettingsContextValue extends SettingsState {
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<boolean>;
  updateMultipleSettings: (settings: Partial<Settings>) => Promise<boolean>;
  saveAllSettings: () => Promise<boolean>;
  resetSettings: () => Promise<boolean>;
  loadSettings: () => Promise<void>;
  getSetting: <K extends keyof Settings>(key: K) => Settings[K];
  isSettingActive: (key: keyof Settings) => boolean;
  requiresRestart: (key: keyof Settings) => boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialSettingsState);

  const loadSettings = useCallback(async () => {
    dispatch(SettingsActions.setLoading(true));
    dispatch(SettingsActions.clearError());
    try {
      const localSettings = settingsService.loadFromLocal();
      if (localSettings) {
        dispatch(SettingsActions.setSettings(localSettings));
      } else {
        dispatch(SettingsActions.setSettings(DEFAULT_SETTINGS));
        settingsService.saveToLocal(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل الإعدادات:', error);
      dispatch(SettingsActions.setSettings(DEFAULT_SETTINGS));
    } finally {
      dispatch(SettingsActions.setLoading(false));
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSetting = useCallback(
    async <K extends keyof Settings>(key: K, value: Settings[K]): Promise<boolean> => {
      if (state.settings[key] === value) {
        console.log(`ℹ️ الإعداد ${String(key)} = ${value} متطابق، تخطي`);
        return true;
      }
      dispatch(SettingsActions.setSaving(true));
      dispatch(SettingsActions.clearError());
      try {
        dispatch(SettingsActions.updateSetting(key, value));
        const currentSettings = { ...state.settings, [key]: value };
        settingsService.saveToLocal(currentSettings);
        await settingsService.applySetting(key, value);
        dispatch(SettingsActions.setLastSaved(new Date()));
        dispatch(SettingsActions.setSaving(false));
        return true;
      } catch (error) {
        console.error(`❌ فشل تحديث ${String(key)}:`, error);
        dispatch(SettingsActions.setSaving(false));
        return false;
      }
    },
    [state.settings]
  );

  const updateMultipleSettings = useCallback(
    async (settings: Partial<Settings>): Promise<boolean> => {
      let hasChanges = false;
      for (const key of Object.keys(settings) as (keyof Settings)[]) {
        if (state.settings[key] !== settings[key]) {
          hasChanges = true;
          break;
        }
      }
      if (!hasChanges) {
        console.log('ℹ️ الإعدادات المتعددة متطابقة، تخطي');
        return true;
      }
      dispatch(SettingsActions.setSaving(true));
      try {
        const newSettings = { ...state.settings, ...settings };
        dispatch(SettingsActions.updateMultipleSettings(settings));
        settingsService.saveToLocal(newSettings);
        await settingsService.applyAllSettings(newSettings);
        dispatch(SettingsActions.setLastSaved(new Date()));
        dispatch(SettingsActions.setSaving(false));
        return true;
      } catch (error) {
        console.error('❌ فشل تحديث الإعدادات المتعددة:', error);
        dispatch(SettingsActions.setSaving(false));
        return false;
      }
    },
    [state.settings]
  );

  const saveAllSettings = useCallback(async (): Promise<boolean> => {
    dispatch(SettingsActions.setSaving(true));
    try {
      settingsService.saveToLocal(state.settings);
      await settingsService.applyAllSettings(state.settings);
      dispatch(SettingsActions.setLastSaved(new Date()));
      dispatch(SettingsActions.setSaving(false));
      return true;
    } catch (error) {
      console.error('❌ فشل حفظ جميع الإعدادات:', error);
      dispatch(SettingsActions.setSaving(false));
      return false;
    }
  }, [state.settings]);

  const resetSettings = useCallback(async (): Promise<boolean> => {
    dispatch(SettingsActions.setSaving(true));
    try {
      dispatch(SettingsActions.resetSettings());
      settingsService.saveToLocal(DEFAULT_SETTINGS);
      await settingsService.applyAllSettings(DEFAULT_SETTINGS);
      dispatch(SettingsActions.setLastSaved(new Date()));
      dispatch(SettingsActions.setSaving(false));
      return true;
    } catch (error) {
      console.error('❌ فشل إعادة ضبط الإعدادات:', error);
      dispatch(SettingsActions.setSaving(false));
      return false;
    }
  }, []);

  const getSetting = useCallback(<K extends keyof Settings>(key: K): Settings[K] => {
    return state.settings[key];
  }, [state.settings]);

  const isSettingActive = useCallback((key: keyof Settings): boolean => {
    const value = state.settings[key];
    return typeof value === 'boolean' ? value : false;
  }, [state.settings]);

  const requiresRestart = useCallback((key: keyof Settings): boolean => {
    return settingsService.requiresRestart(key);
  }, []);

  const contextValue: SettingsContextValue = {
    ...state,
    updateSetting,
    updateMultipleSettings,
    saveAllSettings,
    resetSettings,
    loadSettings,
    getSetting,
    isSettingActive,
    requiresRestart,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}

export { SettingsContext };