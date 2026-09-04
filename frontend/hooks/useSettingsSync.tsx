'use client';

import { useEffect, useRef } from 'react';
import { useSettingsContext } from '@/context/SettingsContext';
import { settingsService } from '@/services/settingsService';
import { Settings } from '@/types/settings.types';

export function useSettingsSync(
  enabled: boolean = true,
  debounceDelay: number = 300
) {
  const { settings, updateSetting } = useSettingsContext();
  const previousSettings = useRef<Settings>(settings);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const changedKeys = Object.keys(settings).filter(
      (key) =>
        settings[key as keyof Settings] !==
        previousSettings.current[key as keyof Settings]
    ) as (keyof Settings)[];

    if (changedKeys.length === 0) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      console.log(`🔄 مزامنة الإعدادات: ${changedKeys.join(', ')}`);
      for (const key of changedKeys) {
        const value = settings[key];
        try {
          await settingsService.applySetting(key, value);
        } catch (error) {
          console.error(`❌ فشل مزامنة الإعداد ${String(key)}:`, error);
        }
      }
      previousSettings.current = { ...settings };
    }, debounceDelay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [settings, enabled, debounceDelay]);

  useEffect(() => {
    if (!enabled) return;

    const handleExternalChange = async (event: CustomEvent) => {
      const { key, value, all } = event.detail;

      if (all) {
        for (const k of Object.keys(all) as (keyof Settings)[]) {
          if (settings[k] !== all[k]) {
            await updateSetting(k, all[k]);
          }
        }
      } else if (key !== undefined && value !== undefined) {
        if (settings[key] !== value) {
          await updateSetting(key, value);
        } else {
          console.log(`ℹ️ الإعداد ${String(key)} = ${value} متطابق، تخطي التحديث`);
        }
      }
    };

    window.addEventListener(
      'settingsChanged',
      handleExternalChange as EventListener
    );

    return () => {
      window.removeEventListener(
        'settingsChanged',
        handleExternalChange as EventListener
      );
    };
  }, [enabled, updateSetting, settings]);

  const syncNow = async () => {
    try {
      await settingsService.applyAllSettings(settings);
      previousSettings.current = { ...settings };
      console.log('✅ تمت المزامنة اليدوية');
    } catch (error) {
      console.error('❌ فشلت المزامنة اليدوية:', error);
    }
  };

  return { syncNow, isSyncing: timeoutRef.current !== null };
}