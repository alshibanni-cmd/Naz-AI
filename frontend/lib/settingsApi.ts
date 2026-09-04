import { Settings, DEFAULT_SETTINGS } from '@/types/settings.types';

export const settingsApi = {
  async getSettings(): Promise<Settings | null> {
    return null;
  },
  async updateSetting(): Promise<boolean> {
    return true;
  },
  async saveAllSettings(): Promise<boolean> {
    return true;
  },
  async resetSettings(): Promise<boolean> {
    return true;
  },
  async applySettingToRuntime(): Promise<boolean> {
    return true;
  },
  async applyAllSettingsToRuntime(): Promise<boolean> {
    return true;
  },
  async getSettingsHistory(): Promise<any[]> {
    return [];
  },
};