import { Settings, DEFAULT_SETTINGS, RESTART_REQUIRED_SETTINGS } from '@/types/settings.types';

const STORAGE_KEY = 'naz_ai_settings';

export const settingsService = {
  async loadSettings(): Promise<Settings> {
    try {
      const localSettings = this.loadFromLocal();
      if (localSettings) return localSettings;
    } catch (error) {
      console.warn('⚠️ فشل تحميل الإعدادات من LocalStorage');
    }
    return DEFAULT_SETTINGS;
  },

  saveToLocal(settings: Settings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('❌ خطأ في حفظ الإعدادات:', error);
    }
  },

  loadFromLocal(): Settings | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل الإعدادات:', error);
    }
    return null;
  },

  async applySetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
    const current = this.loadFromLocal() || DEFAULT_SETTINGS;
    if (current[key] === value) {
      console.log(`ℹ️ الإعداد ${String(key)} لم يتغير (${value})، تخطي`);
      return;
    }
    const updated = { ...current, [key]: value };
    this.saveToLocal(updated);
    window.dispatchEvent(
      new CustomEvent('settingsChanged', {
        detail: { key, value },
      })
    );
    console.log(`✅ تم تطبيق الإعداد ${String(key)} = ${value} محلياً`);
  },

  async applyAllSettings(settings: Settings): Promise<void> {
    const current = this.loadFromLocal() || DEFAULT_SETTINGS;
    if (JSON.stringify(current) === JSON.stringify(settings)) {
      console.log('ℹ️ الإعدادات لم تتغير، تخطي');
      return;
    }
    this.saveToLocal(settings);
    window.dispatchEvent(
      new CustomEvent('settingsChanged', {
        detail: { all: settings },
      })
    );
    console.log('✅ تم تطبيق جميع الإعدادات محلياً');
  },

  getSetting<K extends keyof Settings>(key: K): Settings[K] | null {
    const settings = this.loadFromLocal();
    if (settings && key in settings) return settings[key];
    return DEFAULT_SETTINGS[key] ?? null;
  },

  requiresRestart<K extends keyof Settings>(key: K): boolean {
    return RESTART_REQUIRED_SETTINGS.includes(key);
  },

  updateLocalOnly<K extends keyof Settings>(key: K, value: Settings[K]): void {
    const current = this.loadFromLocal() || DEFAULT_SETTINGS;
    this.saveToLocal({ ...current, [key]: value });
  },

  clearLocal(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};