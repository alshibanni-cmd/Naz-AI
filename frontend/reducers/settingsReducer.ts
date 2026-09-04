// ============================================
// reducers/settingsReducer.ts
// إدارة حالة الإعدادات باستخدام Reducer
// ============================================

import { SettingsState, Settings, DEFAULT_SETTINGS } from '@/types/settings.types';

// ---------- تعريف الأحداث (Actions) ----------
export type SettingsAction =
  // تحميل/حفظ
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  
  // تحديث
  | { type: 'UPDATE_SETTING'; payload: { key: keyof Settings; value: any } }
  | { type: 'UPDATE_MULTIPLE_SETTINGS'; payload: Partial<Settings> }
  
  // إعادة ضبط
  | { type: 'RESET_SETTINGS' }
  
  // أخطاء
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// ---------- الحالة الافتراضية ----------
export const initialSettingsState: SettingsState = {
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  isSaving: false,
  error: null,
  lastSaved: null,
};

// ---------- الدالة الرئيسية (Reducer) ----------
export function settingsReducer(
  state: SettingsState,
  action: SettingsAction
): SettingsState {
  switch (action.type) {
    // --- تحميل ---
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_SAVING':
      return {
        ...state,
        isSaving: action.payload,
      };

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload,
        isLoading: false,
        error: null,
      };

    case 'SET_LAST_SAVED':
      return {
        ...state,
        lastSaved: action.payload,
      };

    // --- تحديث ---
    case 'UPDATE_SETTING': {
      const { key, value } = action.payload;
      // التأكد من أن المفتاح موجود في الإعدادات
      if (!(key in state.settings)) {
        return {
          ...state,
          error: `الإعداد "${String(key)}" غير موجود`,
        };
      }
      return {
        ...state,
        settings: {
          ...state.settings,
          [key]: value,
        },
        error: null,
      };
    }

    case 'UPDATE_MULTIPLE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
        error: null,
      };

    // --- إعادة ضبط ---
    case 'RESET_SETTINGS':
      return {
        ...state,
        settings: DEFAULT_SETTINGS,
        error: null,
      };

    // --- أخطاء ---
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isSaving: false,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// ---------- دوال مساعدة لإنشاء الأحداث (Action Creators) ----------
export const SettingsActions = {
  setLoading: (loading: boolean): SettingsAction => ({
    type: 'SET_LOADING',
    payload: loading,
  }),

  setSaving: (saving: boolean): SettingsAction => ({
    type: 'SET_SAVING',
    payload: saving,
  }),

  setSettings: (settings: Settings): SettingsAction => ({
    type: 'SET_SETTINGS',
    payload: settings,
  }),

  setLastSaved: (date: Date): SettingsAction => ({
    type: 'SET_LAST_SAVED',
    payload: date,
  }),

  updateSetting: <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ): SettingsAction => ({
    type: 'UPDATE_SETTING',
    payload: { key, value },
  }),

  updateMultipleSettings: (settings: Partial<Settings>): SettingsAction => ({
    type: 'UPDATE_MULTIPLE_SETTINGS',
    payload: settings,
  }),

  resetSettings: (): SettingsAction => ({
    type: 'RESET_SETTINGS',
  }),

  setError: (error: string | null): SettingsAction => ({
    type: 'SET_ERROR',
    payload: error,
  }),

  clearError: (): SettingsAction => ({
    type: 'CLEAR_ERROR',
  }),
};