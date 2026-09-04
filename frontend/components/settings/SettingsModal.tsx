'use client';

import { useState, useEffect } from 'react';
import { X, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useSettingsContext } from '@/context/SettingsContext';
import { settingsService } from '@/services/settingsService';
import { Settings, DEFAULT_SETTINGS } from '@/types/settings.types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string; // ✅ جديد – لتحديد التبويب النشط عند الفتح
}

export default function SettingsModal({ isOpen, onClose, initialSection = 'عام' }: SettingsModalProps) {
  const {
    settings,
    isLoading,
    isSaving,
    error,
    lastSaved,
    updateSetting,
    saveAllSettings,
    resetSettings,
    loadSettings,
  } = useSettingsContext();

  const [active, setActive] = useState(initialSection);
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // تحديث active عند تغيير initialSection
  useEffect(() => {
    if (initialSection) {
      setActive(initialSection);
    }
  }, [initialSection]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadSettings();
      setSaveSuccess(false);
      if (initialSection) setActive(initialSection);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, loadSettings, initialSection]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections = [
    'عام',
    'الذكاء الاصطناعي والنماذج',
    'التخصيص',
    'الذاكرة',
    'المعرفة',
    'الأدوات',
    'تحليل البيانات',
    'التصور',
    'التقارير',
    'الأتمتة',
    'الخصوصية والأمان',
    'متقدم'
  ];

  const sectionConfig: Record<string, Array<{
    key: keyof Settings;
    label: string;
    desc: string;
    type: 'toggle' | 'select' | 'input' | 'textarea';
    options?: string[];
  }>> = {
    'عام': [
      { key: 'language', label: 'اللغة', desc: 'اختر لغة الواجهة', type: 'select', options: ['ar', 'en', 'fr'] },
      { key: 'theme', label: 'المظهر', desc: 'فاتح، داكن، أو تلقائي', type: 'select', options: ['light', 'dark', 'system'] },
      { key: 'accentColor', label: 'اللون المميز', desc: 'اختر لون الواجهة', type: 'select', options: ['blue', 'green', 'purple', 'red', 'orange'] },
      { key: 'taskNotifications', label: 'إشعارات المهام', desc: 'تلقي إشعارات عند إكمال المهام', type: 'toggle' },
    ],
    'الذكاء الاصطناعي والنماذج': [
      { key: 'defaultModel', label: 'النموذج الافتراضي', desc: 'اختر نموذج الذكاء الاصطناعي', type: 'select', options: ['auto', 'fast', 'reasoning', 'coding'] },
      { key: 'thinkingLevel', label: 'مستوى التفكير', desc: 'التحكم في عمق التفكير', type: 'select', options: ['fast', 'balanced', 'deep'] },
      { key: 'autoRouting', label: 'التوجيه التلقائي', desc: 'دع الذكاء الاصطناعي يختار النموذج المناسب', type: 'toggle' },
    ],
    'التخصيص': [
      { key: 'personality', label: 'الشخصية', desc: 'كيف يتحدث معك الذكاء الاصطناعي', type: 'select', options: ['professional', 'friendly', 'academic', 'direct'] },
      { key: 'responseLength', label: 'أسلوب الردود', desc: 'مستوى التفصيل في الإجابات', type: 'select', options: ['concise', 'balanced', 'detailed'] },
      { key: 'customInstructions', label: 'تعليمات مخصصة', desc: 'تعليمات دائمة للذكاء الاصطناعي', type: 'textarea' },
    ],
    'الذاكرة': [
      { key: 'memory', label: 'الذاكرة', desc: 'تذكر التفضيلات عبر الجلسات', type: 'toggle' },
      { key: 'projectContext', label: 'سياق المشروع', desc: 'استخدام ملفات المشروع كسياق', type: 'toggle' },
      { key: 'temporarySession', label: 'جلسة مؤقتة', desc: 'عدم حفظ الذاكرة', type: 'toggle' },
    ],
    'المعرفة': [
      { key: 'projectFiles', label: 'ملفات المشروع', desc: 'استخدام ملفات المشروع كمصدر معرفة', type: 'toggle' },
      { key: 'webSearch', label: 'البحث على الويب', desc: 'السماح بالبحث على الإنترنت', type: 'toggle' },
      { key: 'externalSources', label: 'مصادر خارجية', desc: 'استخدام مجموعات بيانات خارجية', type: 'toggle' },
    ],
    'الأدوات': [
      { key: 'fileAnalysis', label: 'تحليل الملفات', desc: 'قراءة الملفات المرفوعة', type: 'toggle' },
      { key: 'pythonExecution', label: 'تنفيذ الأكواد', desc: 'تشغيل أكواد Python', type: 'toggle' },
      { key: 'sensitiveActions', label: 'إجراءات حساسة', desc: 'طلب موافقة قبل الإجراءات الخطيرة', type: 'toggle' },
    ],
    'تحليل البيانات': [
      { key: 'confidenceLevel', label: 'مستوى الثقة', desc: 'فترة الثقة الافتراضية', type: 'select', options: ['90', '95', '99'] },
      { key: 'decimalPrecision', label: 'الأرقام العشرية', desc: 'دقة الأرقام المعروضة', type: 'select', options: ['0', '1', '2', '3'] },
      { key: 'missingDataStrategy', label: 'القيم المفقودة', desc: 'كيفية التعامل مع البيانات المفقودة', type: 'select', options: ['ai_decides', 'exclude', 'impute'] },
    ],
    'التصور': [
      { key: 'autoChartSelection', label: 'اختيار المخطط', desc: 'يقترح الذكاء نوع المخطط المناسب', type: 'toggle' },
      { key: 'visualizationStyle', label: 'نمط العرض', desc: 'موضوع التصور', type: 'select', options: ['standard', 'professional', 'academic'] },
      { key: 'showValues', label: 'إظهار القيم', desc: 'عرض القيم على المخططات', type: 'toggle' },
    ],
    'التقارير': [
      { key: 'reportLanguage', label: 'لغة التقارير', desc: 'اللغة الافتراضية للتقارير', type: 'select', options: ['ar', 'en', 'fr'] },
      { key: 'reportTemplate', label: 'قالب التقرير', desc: 'هيكل التقرير', type: 'select', options: ['research', 'executive', 'meal'] },
      { key: 'structuredExport', label: 'تصدير منظم', desc: 'تنسيق الجداول والمخططات عند التصدير', type: 'toggle' },
    ],
    'الأتمتة': [
      { key: 'autoUpdate', label: 'تحديث تلقائي', desc: 'تحديث المخرجات عند تغيير البيانات', type: 'toggle' },
      { key: 'errorAlerts', label: 'تنبيهات', desc: 'إشعارات عند الأخطاء', type: 'toggle' },
      { key: 'scheduledTasks', label: 'مهام مجدولة', desc: 'السماح بمهام ذكاء اصطناعي مجدولة', type: 'toggle' },
    ],
    'الخصوصية والأمان': [
      { key: 'privateSession', label: 'جلسة خاصة', desc: 'عدم استخدام الذاكرة', type: 'toggle' },
      { key: 'requireApproval', label: 'موافقة مطلوبة', desc: 'تأكيد الإجراءات الحساسة', type: 'toggle' },
      { key: 'auditLog', label: 'سجل التدقيق', desc: 'تسجيل نشاطات الذكاء الاصطناعي', type: 'toggle' },
    ],
    'متقدم': [
      { key: 'advancedMode', label: 'الوضع المتقدم', desc: 'عرض الخيارات التقنية', type: 'toggle' },
      { key: 'contextSize', label: 'حجم السياق', desc: 'السياق المتاح', type: 'select', options: ['auto', 'standard', 'extended'] },
      { key: 'developerMode', label: 'وضع المطور', desc: 'عرض أدوات التصحيح', type: 'toggle' },
    ],
  };

  const items = sectionConfig[active] || [];

  const handleSettingChange = async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    await updateSetting(key, value);
  };

  const renderControl = (item: typeof items[0]) => {
    const value = localSettings[item.key];
    const isRestartRequired = settingsService.requiresRestart(item.key);

    if (item.type === 'toggle') {
      return (
        <div className="flex items-center gap-3">
          <div
            className={`w-[42px] h-[24px] rounded-full relative cursor-pointer flex-shrink-0 transition-colors ${
              value ? 'bg-[#1d4ed8]' : 'bg-[#cbd5e1]'
            }`}
            onClick={() => handleSettingChange(item.key, !value)}
          >
            <div
              className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-md transition-all ${
                value ? 'right-[21px]' : 'right-[3px]'
              }`}
            />
          </div>
          {isRestartRequired && (
            <span className="text-[10px] text-amber-500" title="يتطلب إعادة تشغيل">🔄</span>
          )}
        </div>
      );
    }

    if (item.type === 'select') {
      const displayLabels: Record<string, string> = {
        ar: 'العربية', en: 'English', fr: 'Français',
        light: 'فاتح', dark: 'داكن', system: 'تلقائي',
        blue: 'أزرق', green: 'أخضر', purple: 'بنفسجي', red: 'أحمر', orange: 'برتقالي',
        professional: 'مهني', friendly: 'ودود', academic: 'أكاديمي', direct: 'مباشر',
        concise: 'موجز', balanced: 'متوازن', detailed: 'مفصل',
        ai_decides: 'يقرر الذكاء', exclude: 'استبعاد', impute: 'تقدير',
        standard: 'قياسي', research: 'بحثي', executive: 'تنفيذي', meal: 'MEAL',
        auto: 'تلقائي', fast: 'سريع', reasoning: 'استدلال', coding: 'برمجة',
        deep: 'عميق', extended: 'ممتد'
      };

      return (
        <select
          value={value as string}
          onChange={(e) => handleSettingChange(item.key, e.target.value as any)}
          className="px-[14px] py-[6px] rounded-[10px] border border-[#e2e8f0] bg-white text-[14px] text-[#0f172a] outline-none cursor-pointer min-w-[140px] focus:border-[#1d4ed8] focus:shadow-[0_0_0_3px_rgba(29,78,216,0.1)]"
        >
          {item.options?.map((opt) => (
            <option key={opt} value={opt}>
              {displayLabels[opt] || opt}
            </option>
          ))}
        </select>
      );
    }

    if (item.type === 'input') {
      return (
        <input
          type="text"
          value={value as string}
          onChange={(e) => handleSettingChange(item.key, e.target.value as any)}
          placeholder="اكتب تعليماتك..."
          className="px-[14px] py-[6px] rounded-[10px] border border-[#e2e8f0] bg-white text-[14px] text-[#0f172a] outline-none min-w-[200px] focus:border-[#1d4ed8] focus:shadow-[0_0_0_3px_rgba(29,78,216,0.1)] placeholder:text-[#94a3b8]"
        />
      );
    }

    if (item.type === 'textarea') {
      return (
        <textarea
          value={value as string}
          onChange={(e) => handleSettingChange(item.key, e.target.value as any)}
          placeholder="اكتب تعليماتك..."
          rows={3}
          className="px-[14px] py-[6px] rounded-[10px] border border-[#e2e8f0] bg-white text-[14px] text-[#0f172a] outline-none min-w-[250px] min-h-[80px] focus:border-[#1d4ed8] focus:shadow-[0_0_0_3px_rgba(29,78,216,0.1)] placeholder:text-[#94a3b8] resize-y"
        />
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-[960px] max-h-[90vh] overflow-hidden flex flex-col border border-white/5"
          style={{ direction: 'rtl' }}
        >
          <div className="flex items-center justify-between px-7 py-[18px] border-b border-[#e9edf2] bg-white flex-shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-[#0f172a]">⚙️ الإعدادات</h2>
              {isSaving && (
                <span className="text-xs text-blue-600 animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  جاري الحفظ...
                </span>
              )}
              {saveSuccess && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  تم الحفظ
                </span>
              )}
              {error && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </span>
              )}
              {lastSaved && (
                <span className="text-[10px] text-gray-400">
                  آخر حفظ: {lastSaved.toLocaleTimeString('ar-EG')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={saveAllSettings}
                disabled={isSaving}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                حفظ الكل
              </button>
              <button
                onClick={loadSettings}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
                title="إعادة تحميل الإعدادات"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 border-none bg-transparent text-2xl cursor-pointer text-[#64748b] rounded-[10px] flex items-center justify-center transition-all hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden bg-white">
            <div className="w-[220px] flex-shrink-0 overflow-y-auto px-3 py-4 border-l border-[#e9edf2] bg-[#fafcff]">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setActive(section)}
                  className={`w-full text-right px-[14px] py-[10px] border-none bg-transparent rounded-[10px] text-[14px] cursor-pointer transition-all mb-[2px] font-medium ${
                    active === section
                      ? 'bg-[#dbeafe] text-[#1d4ed8] font-semibold'
                      : 'text-[#475569] hover:bg-[#eef2f6] hover:text-[#0f172a]'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-7 bg-white">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-[22px] font-bold text-[#0f172a]">{active}</h3>
                <span className="text-xs text-gray-400">{items.length} إعدادات</span>
              </div>
              <p className="text-[14px] text-[#94a3b8] mb-6">
                قم بتخصيص إعدادات هذا القسم. التغييرات تُطبق فوراً.
              </p>

              <div className="space-y-0">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-[14px] border-b border-[#f1f5f9] last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="text-[15px] font-semibold text-[#0f172a]">{item.label}</div>
                      <div className="text-[13px] text-[#94a3b8] mt-0.5">{item.desc}</div>
                    </div>
                    <div className="flex-shrink-0 mr-4">{renderControl(item)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-[#e9edf2] flex justify-end gap-3">
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="text-sm text-red-600 hover:text-red-800 transition px-4 py-2 rounded-lg hover:bg-red-50"
                  >
                    إعادة ضبط الإعدادات
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">هل أنت متأكد؟</span>
                    <button
                      onClick={async () => {
                        setShowResetConfirm(false);
                        const success = await resetSettings();
                        if (success) {
                          setLocalSettings(DEFAULT_SETTINGS);
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 3000);
                        }
                      }}
                      className="text-sm bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition"
                    >
                      نعم، إعادة ضبط
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 transition"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}