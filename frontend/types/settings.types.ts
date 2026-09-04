// ============================================
// types/settings.types.ts
// تعريف جميع أنواع الإعدادات وأنظمتها
// ============================================

// ---------- الأنواع الأساسية ----------
export type Language = 'ar' | 'en' | 'fr';
export type Theme = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'green' | 'purple' | 'red' | 'orange';
export type Personality = 'professional' | 'friendly' | 'academic' | 'direct';
export type ResponseLength = 'concise' | 'balanced' | 'detailed';
export type ConfidenceLevel = '90' | '95' | '99';
export type DecimalPrecision = '0' | '1' | '2' | '3';
export type MissingDataStrategy = 'ai_decides' | 'exclude' | 'impute';
export type VisualizationStyle = 'standard' | 'professional' | 'academic';
export type ReportTemplate = 'research' | 'executive' | 'meal';
export type ContextSize = 'auto' | 'standard' | 'extended';
export type ModelType = 'auto' | 'fast' | 'reasoning' | 'coding';
export type ThinkingLevel = 'fast' | 'balanced' | 'deep';

// ---------- الواجهة الرئيسية للإعدادات ----------
export interface Settings {
  // عام
  language: Language;
  theme: Theme;
  accentColor: AccentColor;
  taskNotifications: boolean;

  // الذكاء الاصطناعي والنماذج
  defaultModel: ModelType;
  thinkingLevel: ThinkingLevel;
  autoRouting: boolean;

  // التخصيص
  personality: Personality;
  responseLength: ResponseLength;
  customInstructions: string;

  // الذاكرة
  memory: boolean;
  projectContext: boolean;
  temporarySession: boolean;

  // المعرفة
  projectFiles: boolean;
  webSearch: boolean;
  externalSources: boolean;

  // الأدوات
  fileAnalysis: boolean;
  pythonExecution: boolean;
  sensitiveActions: boolean;

  // تحليل البيانات
  confidenceLevel: ConfidenceLevel;
  decimalPrecision: DecimalPrecision;
  missingDataStrategy: MissingDataStrategy;

  // التصور
  autoChartSelection: boolean;
  visualizationStyle: VisualizationStyle;
  showValues: boolean;

  // التقارير
  reportLanguage: Language;
  reportTemplate: ReportTemplate;
  structuredExport: boolean;

  // الأتمتة
  autoUpdate: boolean;
  errorAlerts: boolean;
  scheduledTasks: boolean;

  // الخصوصية والأمان
  privateSession: boolean;
  requireApproval: boolean;
  auditLog: boolean;

  // متقدم
  advancedMode: boolean;
  contextSize: ContextSize;
  developerMode: boolean;
}

export type SettingScope = 'global' | 'workspace' | 'project' | 'conversation' | 'session';

export interface SettingDefinition {
  key: keyof Settings;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'textarea' | 'slider';
  scope: SettingScope;
  defaultValue: any;
  options?: string[];
  requiresRestart?: boolean;
  category: SettingCategory;
}

export type SettingCategory =
  | 'general'
  | 'ai_models'
  | 'personalization'
  | 'memory'
  | 'knowledge'
  | 'tools'
  | 'data_analysis'
  | 'visualization'
  | 'reports'
  | 'automation'
  | 'privacy_security'
  | 'advanced';

export interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaved: Date | null;
}

export interface SettingsValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'ar',
  theme: 'system',
  accentColor: 'blue',
  taskNotifications: true,
  defaultModel: 'auto',
  thinkingLevel: 'balanced',
  autoRouting: true,
  personality: 'professional',
  responseLength: 'balanced',
  customInstructions: '',
  memory: true,
  projectContext: true,
  temporarySession: false,
  projectFiles: true,
  webSearch: true,
  externalSources: false,
  fileAnalysis: true,
  pythonExecution: true,
  sensitiveActions: false,
  confidenceLevel: '95',
  decimalPrecision: '2',
  missingDataStrategy: 'ai_decides',
  autoChartSelection: true,
  visualizationStyle: 'standard',
  showValues: true,
  reportLanguage: 'ar',
  reportTemplate: 'executive',
  structuredExport: true,
  autoUpdate: true,
  errorAlerts: true,
  scheduledTasks: false,
  privateSession: false,
  requireApproval: true,
  auditLog: false,
  advancedMode: false,
  contextSize: 'auto',
  developerMode: false,
};

export const RESTART_REQUIRED_SETTINGS: (keyof Settings)[] = [
  'language',
  'theme',
  'advancedMode',
  'developerMode',
];

export const SENSITIVE_SETTINGS: (keyof Settings)[] = [
  'sensitiveActions',
  'privateSession',
  'auditLog',
  'pythonExecution',
];