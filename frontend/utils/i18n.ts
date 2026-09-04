// utils/i18n.ts
export type Language = 'ar' | 'en' | 'fr';

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // ============================================================
    // عام
    // ============================================================
    'app.welcome': 'مرحباً بك في Naz AI',
    'app.subtitle': 'شريكك الذكي للعمل',
    'app.login': 'تسجيل الدخول',
    'app.logout': 'تسجيل الخروج',
    'app.register': 'إنشاء حساب',
    'app.settings': 'الإعدادات',
    'app.save': 'حفظ',
    'app.cancel': 'إلغاء',
    'app.apply': 'تطبيق',
    'app.reset': 'إعادة ضبط',
    'app.search': 'بحث...',
    'app.loading': 'جاري التحميل...',
    'app.success': 'تم بنجاح',
    'app.error': 'حدث خطأ',
    'app.confirm': 'تأكيد',
    'app.close': 'إغلاق',
    'app.back': 'رجوع',
    'app.next': 'التالي',
    'app.done': 'تم',
    'app.chat_placeholder': 'صف ما تريد أن يفعله Naz...',
    'app.login_to_start': 'سجل دخولك لبدء العمل...',
    'app.attach_file': 'إرفاق ملف',
    'app.run': 'تشغيل',
    'app.quick_tasks': 'المهام السريعة',
    'app.under_development': 'قيد التطوير',
    'app.page_in_progress': 'هذه الصفحة قيد الإعداد',
    'app.user': 'مستخدم',
    'app.online': 'متصل',
    'app.guest': 'زائر',

    // ============================================================
    // الشريط الجانبي
    // ============================================================
    'sidebar.work_basic': 'العمل الأساسي',
    'sidebar.home': 'الرئيسية',
    'sidebar.naz': 'Naz',
    'sidebar.tasks': 'المهام',
    'sidebar.inbox': 'صندوق الوارد',
    'sidebar.tools': 'الأدوات',
    'sidebar.data': 'البيانات',
    'sidebar.research': 'البحث',
    'sidebar.files': 'الملفات',
    'sidebar.dashboards': 'لوحات المعلومات',
    'sidebar.reports': 'التقارير',
    'sidebar.management': 'الإدارة',
    'sidebar.knowledge': 'المعرفة',
    'sidebar.skills': 'المهارات',
    'sidebar.projects': 'المشاريع',
    'sidebar.settings': 'الإعدادات',

    // ============================================================
    // الإعدادات - الأقسام
    // ============================================================
    'settings.title': 'الإعدادات',
    'settings.general': 'عام',
    'settings.personalization': 'التخصيص',
    'settings.ai_behavior': 'سلوك AI',
    'settings.memory_knowledge': 'الذاكرة والمعرفة',
    'settings.tools_integrations': 'الأدوات والتكاملات',
    'settings.data_files': 'البيانات والملفات',
    'settings.automation': 'الأتمتة',
    'settings.privacy_security': 'الخصوصية والأمان',
    'settings.workspace_team': 'مساحة العمل والفريق',
    'settings.usage_billing': 'الاستخدام والفوترة',
    'settings.advanced': 'متقدم',
    'settings.developer': 'المطور',
    'settings.extra': 'ملحقات إضافية',
    'settings.help_support': 'المساعدة والدعم',
    'settings.feedback_updates': 'الملاحظات والتحديثات',
    'settings.about': 'حول Naz',
    'settings.search_placeholder': 'ابحث في الإعدادات...',
    'settings.no_settings': 'لا توجد إعدادات',
    'settings.change_search': 'جرب تغيير مصطلح البحث',

    // ============================================================
    // الإعدادات - عناصر التحكم (التسميات)
    // ============================================================
    'settings.theme': 'المظهر',
    'settings.accentColor': 'اللون المميز',
    'settings.interfaceDensity': 'كثافة الواجهة',
    'settings.taskNotifications': 'إشعارات المهام',
    'settings.language': 'لغة الواجهة',
    'settings.personality': 'الشخصية',
    'settings.responseLength': 'طول الردود',
    'settings.customInstructions': 'التعليمات المخصصة',
    'settings.thinkingLevel': 'مستوى التفكير',
    'settings.defaultModel': 'النموذج الافتراضي',
    'settings.autoRouting': 'التوجيه التلقائي',
    'settings.useMemory': 'استخدام الذاكرة',
    'settings.projectContext': 'سياق المشروع',
    'settings.projectFiles': 'ملفات المشروع',
    'settings.webSearch': 'البحث على الويب',
    'settings.fileAnalysis': 'تحليل الملفات',
    'settings.python': 'Python',
    'settings.keepOriginalFiles': 'الاحتفاظ بالملفات الأصلية',
    'settings.confidenceLevel': 'مستوى الثقة',
    'settings.decimalPrecision': 'الأرقام العشرية',
    'settings.automaticUpdates': 'التحديث التلقائي',
    'settings.scheduledTasks': 'المهام المجدولة',
    'settings.errorAlerts': 'تنبيهات الأخطاء',
    'settings.privateSession': 'جلسة خاصة',
    'settings.requireApproval': 'طلب الموافقة',
    'settings.auditLog': 'سجل التدقيق',
    'settings.workspaceName': 'اسم مساحة العمل',
    'settings.currentPlan': 'الخطة الحالية',
    'settings.advancedMode': 'الوضع المتقدم',
    'settings.developerMode': 'وضع المطور',

    // ============================================================
    // 🔥 الإعدادات - خيارات القوائم المنسدلة (جديد)
    // ============================================================
    // المظهر (Theme)
    'options.theme.light': 'فاتح',
    'options.theme.dark': 'داكن',
    'options.theme.system': 'تلقائي',

    // اللون المميز (Accent Color)
    'options.accentColor.blue': 'أزرق',
    'options.accentColor.green': 'أخضر',
    'options.accentColor.purple': 'بنفسجي',
    'options.accentColor.red': 'أحمر',
    'options.accentColor.orange': 'برتقالي',

    // كثافة الواجهة (Interface Density)
    'options.interfaceDensity.compact': 'مضغوط',
    'options.interfaceDensity.comfortable': 'مريح',
    'options.interfaceDensity.spacious': 'واسع',

    // اللغة (Language)
    'options.language.ar': 'العربية',
    'options.language.en': 'English',
    'options.language.fr': 'Français',

    // الشخصية (Personality)
    'options.personality.professional': 'مهني',
    'options.personality.friendly': 'ودود',
    'options.personality.academic': 'أكاديمي',
    'options.personality.direct': 'مباشر',

    // طول الردود (Response Length)
    'options.responseLength.brief': 'موجز',
    'options.responseLength.balanced': 'متوازن',
    'options.responseLength.detailed': 'مفصل',

    // مستوى التفكير (Thinking Level)
    'options.thinkingLevel.fast': 'سريع',
    'options.thinkingLevel.balanced': 'متوازن',
    'options.thinkingLevel.deep': 'عميق',

    // النموذج الافتراضي (Default Model)
    'options.defaultModel.auto': 'تلقائي',
    'options.defaultModel.fast': 'سريع',
    'options.defaultModel.advanced': 'متقدم',
    'options.defaultModel.coding': 'برمجة',

    // مستوى الثقة (Confidence Level)
    'options.confidenceLevel.90': '90%',
    'options.confidenceLevel.95': '95%',
    'options.confidenceLevel.99': '99%',

    // الأرقام العشرية (Decimal Precision)
    'options.decimalPrecision.0': '0',
    'options.decimalPrecision.1': '1',
    'options.decimalPrecision.2': '2',
    'options.decimalPrecision.3': '3',

    // الخطة الحالية (Current Plan)
    'options.currentPlan.free': 'مجانية',
    'options.currentPlan.pro': 'احترافية',
    'options.currentPlan.enterprise': 'مؤسسات',

    // ============================================================
    // الإجراءات السريعة
    // ============================================================
    'actions.data_analysis': 'تحليل البيانات',
    'actions.web_search': 'بحث ويب',
    'actions.create_report': 'إنشاء تقرير',
    'actions.build_dashboard': 'بناء Dashboard',
    'actions.analyze_files': 'تحليل ملفات',
    'actions.presentation': 'عرض تقديمي',

    // ============================================================
    // رسائل
    // ============================================================
    'messages.saved': '✅ تم الحفظ',
    'messages.save_failed': '❌ فشل الحفظ',
    'messages.save_error': '❌ خطأ في الحفظ',
    'messages.applied': '✅ تم التطبيق',
    'messages.apply_failed': '❌ فشل التطبيق',
  },

  // ============================================================
  // English (محسّنة وأكثر طبيعية)
  // ============================================================
  en: {
    // General
    'app.welcome': 'Welcome to Naz AI',
    'app.subtitle': 'Your Intelligent Work Partner',
    'app.login': 'Sign In',
    'app.logout': 'Sign Out',
    'app.register': 'Create Account',
    'app.settings': 'Settings',
    'app.save': 'Save',
    'app.cancel': 'Cancel',
    'app.apply': 'Apply',
    'app.reset': 'Reset',
    'app.search': 'Search...',
    'app.loading': 'Loading...',
    'app.success': 'Success',
    'app.error': 'An error occurred',
    'app.confirm': 'Confirm',
    'app.close': 'Close',
    'app.back': 'Back',
    'app.next': 'Next',
    'app.done': 'Done',
    'app.chat_placeholder': 'Describe what you want Naz to do...',
    'app.login_to_start': 'Sign in to start working...',
    'app.attach_file': 'Attach file',
    'app.run': 'Run',
    'app.quick_tasks': 'Quick Tasks',
    'app.under_development': 'Under Development',
    'app.page_in_progress': 'This page is being prepared',
    'app.user': 'User',
    'app.online': 'Online',
    'app.guest': 'Guest',

    // Sidebar
    'sidebar.work_basic': 'Core Work',
    'sidebar.home': 'Home',
    'sidebar.naz': 'Naz',
    'sidebar.tasks': 'Tasks',
    'sidebar.inbox': 'Inbox',
    'sidebar.tools': 'Tools',
    'sidebar.data': 'Data',
    'sidebar.research': 'Research',
    'sidebar.files': 'Files',
    'sidebar.dashboards': 'Dashboards',
    'sidebar.reports': 'Reports',
    'sidebar.management': 'Management',
    'sidebar.knowledge': 'Knowledge',
    'sidebar.skills': 'Skills',
    'sidebar.projects': 'Projects',
    'sidebar.settings': 'Settings',

    // Settings - Sections
    'settings.title': 'Settings',
    'settings.general': 'General',
    'settings.personalization': 'Personalization',
    'settings.ai_behavior': 'AI Behavior',
    'settings.memory_knowledge': 'Memory & Knowledge',
    'settings.tools_integrations': 'Tools & Integrations',
    'settings.data_files': 'Data & Files',
    'settings.automation': 'Automation',
    'settings.privacy_security': 'Privacy & Security',
    'settings.workspace_team': 'Workspace & Team',
    'settings.usage_billing': 'Usage & Billing',
    'settings.advanced': 'Advanced',
    'settings.developer': 'Developer',
    'settings.extra': 'Additional',
    'settings.help_support': 'Help & Support',
    'settings.feedback_updates': 'Feedback & Updates',
    'settings.about': 'About Naz',
    'settings.search_placeholder': 'Search settings...',
    'settings.no_settings': 'No settings found',
    'settings.change_search': 'Try changing your search term',

    // Settings - Control Labels
    'settings.theme': 'Theme',
    'settings.accentColor': 'Accent Color',
    'settings.interfaceDensity': 'Interface Density',
    'settings.taskNotifications': 'Task Notifications',
    'settings.language': 'Interface Language',
    'settings.personality': 'Personality',
    'settings.responseLength': 'Response Length',
    'settings.customInstructions': 'Custom Instructions',
    'settings.thinkingLevel': 'Thinking Level',
    'settings.defaultModel': 'Default Model',
    'settings.autoRouting': 'Auto Routing',
    'settings.useMemory': 'Use Memory',
    'settings.projectContext': 'Project Context',
    'settings.projectFiles': 'Project Files',
    'settings.webSearch': 'Web Search',
    'settings.fileAnalysis': 'File Analysis',
    'settings.python': 'Python',
    'settings.keepOriginalFiles': 'Keep Original Files',
    'settings.confidenceLevel': 'Confidence Level',
    'settings.decimalPrecision': 'Decimal Precision',
    'settings.automaticUpdates': 'Automatic Updates',
    'settings.scheduledTasks': 'Scheduled Tasks',
    'settings.errorAlerts': 'Error Alerts',
    'settings.privateSession': 'Private Session',
    'settings.requireApproval': 'Require Approval',
    'settings.auditLog': 'Audit Log',
    'settings.workspaceName': 'Workspace Name',
    'settings.currentPlan': 'Current Plan',
    'settings.advancedMode': 'Advanced Mode',
    'settings.developerMode': 'Developer Mode',

    // 🔥 Settings - Dropdown Options (New)
    // Theme
    'options.theme.light': 'Light',
    'options.theme.dark': 'Dark',
    'options.theme.system': 'System',

    // Accent Color
    'options.accentColor.blue': 'Blue',
    'options.accentColor.green': 'Green',
    'options.accentColor.purple': 'Purple',
    'options.accentColor.red': 'Red',
    'options.accentColor.orange': 'Orange',

    // Interface Density
    'options.interfaceDensity.compact': 'Compact',
    'options.interfaceDensity.comfortable': 'Comfortable',
    'options.interfaceDensity.spacious': 'Spacious',

    // Language
    'options.language.ar': 'Arabic',
    'options.language.en': 'English',
    'options.language.fr': 'French',

    // Personality
    'options.personality.professional': 'Professional',
    'options.personality.friendly': 'Friendly',
    'options.personality.academic': 'Academic',
    'options.personality.direct': 'Direct',

    // Response Length
    'options.responseLength.brief': 'Brief',
    'options.responseLength.balanced': 'Balanced',
    'options.responseLength.detailed': 'Detailed',

    // Thinking Level
    'options.thinkingLevel.fast': 'Fast',
    'options.thinkingLevel.balanced': 'Balanced',
    'options.thinkingLevel.deep': 'Deep',

    // Default Model
    'options.defaultModel.auto': 'Auto',
    'options.defaultModel.fast': 'Fast',
    'options.defaultModel.advanced': 'Advanced',
    'options.defaultModel.coding': 'Coding',

    // Confidence Level
    'options.confidenceLevel.90': '90%',
    'options.confidenceLevel.95': '95%',
    'options.confidenceLevel.99': '99%',

    // Decimal Precision
    'options.decimalPrecision.0': '0',
    'options.decimalPrecision.1': '1',
    'options.decimalPrecision.2': '2',
    'options.decimalPrecision.3': '3',

    // Current Plan
    'options.currentPlan.free': 'Free',
    'options.currentPlan.pro': 'Pro',
    'options.currentPlan.enterprise': 'Enterprise',

    // Quick Actions
    'actions.data_analysis': 'Data Analysis',
    'actions.web_search': 'Web Search',
    'actions.create_report': 'Create Report',
    'actions.build_dashboard': 'Build Dashboard',
    'actions.analyze_files': 'Analyze Files',
    'actions.presentation': 'Presentation',

    // Messages
    'messages.saved': '✅ Saved',
    'messages.save_failed': '❌ Save failed',
    'messages.save_error': '❌ Save error',
    'messages.applied': '✅ Applied',
    'messages.apply_failed': '❌ Apply failed',
  },

  // ============================================================
  // Français (French)
  // ============================================================
  fr: {
    // Général
    'app.welcome': 'Bienvenue sur Naz AI',
    'app.subtitle': 'Votre partenaire de travail intelligent',
    'app.login': 'Connexion',
    'app.logout': 'Déconnexion',
    'app.register': "S'inscrire",
    'app.settings': 'Paramètres',
    'app.save': 'Enregistrer',
    'app.cancel': 'Annuler',
    'app.apply': 'Appliquer',
    'app.reset': 'Réinitialiser',
    'app.search': 'Rechercher...',
    'app.loading': 'Chargement...',
    'app.success': 'Succès',
    'app.error': 'Une erreur est survenue',
    'app.confirm': 'Confirmer',
    'app.close': 'Fermer',
    'app.back': 'Retour',
    'app.next': 'Suivant',
    'app.done': 'Terminé',
    'app.chat_placeholder': 'Décrivez ce que vous voulez que Naz fasse...',
    'app.login_to_start': 'Connectez-vous pour commencer...',
    'app.attach_file': 'Joindre un fichier',
    'app.run': 'Exécuter',
    'app.quick_tasks': 'Tâches rapides',
    'app.under_development': 'En cours de développement',
    'app.page_in_progress': 'Cette page est en préparation',
    'app.user': 'Utilisateur',
    'app.online': 'En ligne',
    'app.guest': 'Invité',

    // Sidebar
    'sidebar.work_basic': 'Travail de base',
    'sidebar.home': 'Accueil',
    'sidebar.naz': 'Naz',
    'sidebar.tasks': 'Tâches',
    'sidebar.inbox': 'Boîte de réception',
    'sidebar.tools': 'Outils',
    'sidebar.data': 'Données',
    'sidebar.research': 'Recherche',
    'sidebar.files': 'Fichiers',
    'sidebar.dashboards': 'Tableaux de bord',
    'sidebar.reports': 'Rapports',
    'sidebar.management': 'Gestion',
    'sidebar.knowledge': 'Connaissances',
    'sidebar.skills': 'Compétences',
    'sidebar.projects': 'Projets',
    'sidebar.settings': 'Paramètres',

    // Settings - Sections
    'settings.title': 'Paramètres',
    'settings.general': 'Général',
    'settings.personalization': 'Personnalisation',
    'settings.ai_behavior': 'Comportement IA',
    'settings.memory_knowledge': 'Mémoire et connaissances',
    'settings.tools_integrations': 'Outils et intégrations',
    'settings.data_files': 'Données et fichiers',
    'settings.automation': 'Automatisation',
    'settings.privacy_security': 'Confidentialité et sécurité',
    'settings.workspace_team': 'Espace de travail et équipe',
    'settings.usage_billing': 'Utilisation et facturation',
    'settings.advanced': 'Avancé',
    'settings.developer': 'Développeur',
    'settings.extra': 'Suppléments',
    'settings.help_support': 'Aide et support',
    'settings.feedback_updates': 'Retours et mises à jour',
    'settings.about': 'À propos de Naz',
    'settings.search_placeholder': 'Rechercher dans les paramètres...',
    'settings.no_settings': 'Aucun paramètre trouvé',
    'settings.change_search': 'Essayez de modifier votre recherche',

    // Settings - Control Labels
    'settings.theme': 'Thème',
    'settings.accentColor': "Couleur d'accent",
    'settings.interfaceDensity': "Densité de l'interface",
    'settings.taskNotifications': 'Notifications de tâches',
    'settings.language': "Langue de l'interface",
    'settings.personality': 'Personnalité',
    'settings.responseLength': 'Longueur des réponses',
    'settings.customInstructions': 'Instructions personnalisées',
    'settings.thinkingLevel': 'Niveau de réflexion',
    'settings.defaultModel': 'Modèle par défaut',
    'settings.autoRouting': 'Routage automatique',
    'settings.useMemory': 'Utiliser la mémoire',
    'settings.projectContext': 'Contexte du projet',
    'settings.projectFiles': 'Fichiers du projet',
    'settings.webSearch': 'Recherche web',
    'settings.fileAnalysis': 'Analyse de fichiers',
    'settings.python': 'Python',
    'settings.keepOriginalFiles': 'Conserver les fichiers originaux',
    'settings.confidenceLevel': 'Niveau de confiance',
    'settings.decimalPrecision': 'Précision décimale',
    'settings.automaticUpdates': 'Mises à jour automatiques',
    'settings.scheduledTasks': 'Tâches planifiées',
    'settings.errorAlerts': "Alertes d'erreur",
    'settings.privateSession': 'Session privée',
    'settings.requireApproval': "Demander l'approbation",
    'settings.auditLog': "Journal d'audit",
    'settings.workspaceName': "Nom de l'espace de travail",
    'settings.currentPlan': 'Plan actuel',
    'settings.advancedMode': 'Mode avancé',
    'settings.developerMode': 'Mode développeur',

    // 🔥 Settings - Dropdown Options (New)
    // Theme
    'options.theme.light': 'Clair',
    'options.theme.dark': 'Sombre',
    'options.theme.system': 'Système',

    // Accent Color
    'options.accentColor.blue': 'Bleu',
    'options.accentColor.green': 'Vert',
    'options.accentColor.purple': 'Violet',
    'options.accentColor.red': 'Rouge',
    'options.accentColor.orange': 'Orange',

    // Interface Density
    'options.interfaceDensity.compact': 'Compact',
    'options.interfaceDensity.comfortable': 'Confortable',
    'options.interfaceDensity.spacious': 'Spacieux',

    // Language
    'options.language.ar': 'Arabe',
    'options.language.en': 'Anglais',
    'options.language.fr': 'Français',

    // Personality
    'options.personality.professional': 'Professionnel',
    'options.personality.friendly': 'Amical',
    'options.personality.academic': 'Académique',
    'options.personality.direct': 'Direct',

    // Response Length
    'options.responseLength.brief': 'Bref',
    'options.responseLength.balanced': 'Équilibré',
    'options.responseLength.detailed': 'Détaillé',

    // Thinking Level
    'options.thinkingLevel.fast': 'Rapide',
    'options.thinkingLevel.balanced': 'Équilibré',
    'options.thinkingLevel.deep': 'Profond',

    // Default Model
    'options.defaultModel.auto': 'Auto',
    'options.defaultModel.fast': 'Rapide',
    'options.defaultModel.advanced': 'Avancé',
    'options.defaultModel.coding': 'Programmation',

    // Confidence Level
    'options.confidenceLevel.90': '90%',
    'options.confidenceLevel.95': '95%',
    'options.confidenceLevel.99': '99%',

    // Decimal Precision
    'options.decimalPrecision.0': '0',
    'options.decimalPrecision.1': '1',
    'options.decimalPrecision.2': '2',
    'options.decimalPrecision.3': '3',

    // Current Plan
    'options.currentPlan.free': 'Gratuit',
    'options.currentPlan.pro': 'Pro',
    'options.currentPlan.enterprise': 'Entreprise',

    // Quick Actions
    'actions.data_analysis': 'Analyse de données',
    'actions.web_search': 'Recherche web',
    'actions.create_report': 'Créer un rapport',
    'actions.build_dashboard': 'Créer un tableau de bord',
    'actions.analyze_files': 'Analyser les fichiers',
    'actions.presentation': 'Présentation',

    // Messages
    'messages.saved': '✅ Enregistré',
    'messages.save_failed': "❌ Échec de l'enregistrement",
    'messages.save_error': "❌ Erreur d'enregistrement",
    'messages.applied': '✅ Appliqué',
    'messages.apply_failed': "❌ Échec de l'application",
  },
};

export function t(key: string, lang: Language): string {
  const value = translations[lang]?.[key];
  if (value === undefined) {
    // Fallback to Arabic if translation missing
    return translations['ar'][key] || key;
  }
  return value;
}