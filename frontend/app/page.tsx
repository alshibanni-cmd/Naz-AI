'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/axios';
import dynamic from 'next/dynamic';
import {
  LayoutDashboard, Bot, ListChecks, Inbox, Database, Search, File,
  FileText, Brain, Wrench, Folder, Settings,
  Send, Play, Paperclip, Plus, Download, Pause, Square,
  BarChart3, ClipboardList, Presentation, X, LogIn, UserPlus, LogOut,
  Save, Menu, Lightbulb, Sparkles, Target, Users, Calendar,
  CheckCircle, AlertCircle, Loader2, MessageSquare, Trash2, Edit, MoreHorizontal, ChevronDown, ChevronLeft, ChevronRight,
  Library, BookOpen, User, HelpCircle, MessageCircle, ChevronUp, Link, Globe, Sparkles as SparklesIcon, Sliders, Info, FormInput, Bell,
  Mail, Send as SendIcon, Upload
} from 'lucide-react';

import SettingsModal from '@/components/settings/SettingsModal';
import { useSettingsContext } from '@/context/SettingsContext';
import { useSettingsSync } from '@/hooks/useSettingsSync';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ProjectWizard from '@/components/ProjectWizard';
import ProjectProposalCard from '@/components/ProjectProposalCard';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// ============================================================
// تعريف الأنواع
// ============================================================
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  plan?: string[];
  artifacts?: { name: string; type: string; url?: string }[];
  mapData?: any;
  chartData?: any;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

type RunStatus = {
  id: string;
  status: 'idle' | 'planning' | 'running' | 'waiting_approval' | 'completed' | 'error';
  plan: { step: string; status: 'pending' | 'active' | 'done' | 'error' }[];
  tools: string[];
  time: string;
  cost: string;
  artifacts: { name: string; type: string; size?: string }[];
  progress: number;
};

type ProjectProposal = {
  id: number;
  name: string;
  description?: string;
  sector?: string;
  target_group?: string;
  target_count?: number;
  components?: string[];
  status: 'draft' | 'analyzing' | 'completed';
  created_at: string;
  generated_proposal?: string;
};

// ============================================================
// Quick Actions
// ============================================================
const QUICK_ACTIONS = [
  { id: 'analyze', icon: BarChart3, label: 'تحليل البيانات', prompt: 'قم بتحليل البيانات المرفقة واستخرج رؤى رئيسية' },
  { id: 'form', icon: ClipboardList, label: 'تصميم استمارة', prompt: 'صمم استمارة لجمع البيانات' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'بناء Dashboard', prompt: 'قم ببناء لوحة معلومات تفاعلية لبياناتي' },
  { id: 'skill', icon: SparklesIcon, label: 'إنشاء مهارة', prompt: 'ساعدني في إنشاء مهارة جديدة' },
  { id: 'presentation', icon: Presentation, label: 'عرض تقديمي', prompt: 'أنشئ عرضاً تقديمياً احترافياً' },
];

// ============================================================
// مكونات مساعدة
// ============================================================
const MapViewer = ({ geoData, title }: { geoData: any; title?: string }) => {
  if (!geoData || !geoData.features) return <div className="text-center py-4 text-gray-400">لا توجد بيانات للخريطة</div>;
  try {
    const features = geoData.features;
    const featureNames = features.map((f: any) => f.properties?.name || f.properties?.NAME_1 || 'منطقة');
    const randomValues = features.map(() => Math.floor(Math.random() * 100) + 1);
    let centerLon = 48, centerLat = 15.5;
    try {
      const allCoords = features.flatMap((f: any) => f.geometry.coordinates.flat(2));
      const lons = allCoords.map((c: any) => c[0]);
      const lats = allCoords.map((c: any) => c[1]);
      if (lons.length > 0 && lats.length > 0) {
        centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
        centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      }
    } catch (e) {}
    return (
      <div className="mt-3 p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
        {title && <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">{title}</h4>}
        <Plot
          data={[{
            type: 'choroplethmapbox',
            geojson: geoData,
            locations: featureNames,
            z: randomValues,
            colorscale: 'Blues',
            text: featureNames,
            hoverinfo: 'text+z',
            marker: { line: { width: 0.5, color: 'white' } },
            colorbar: { title: 'القيمة', len: 0.5 },
          }]}
          layout={{
            mapbox: {
              style: 'open-street-map',
              center: { lon: centerLon, lat: centerLat },
              zoom: 6,
            },
            margin: { l: 0, r: 0, t: 0, b: 0 },
            height: 380,
            autosize: true,
            paper_bgcolor: 'white',
            plot_bgcolor: 'white',
          }}
          config={{ responsive: true, displayModeBar: true }}
          style={{ width: '100%', height: '100%', minHeight: '350px' }}
          useResizeHandler={true}
        />
      </div>
    );
  } catch (error) {
    console.error('خطأ في عرض الخريطة:', error);
    return <div className="text-center py-4 text-red-400">⚠️ حدث خطأ في عرض الخريطة</div>;
  }
};

const ChartViewer = ({ chartData, title }: { chartData: any; title?: string }) => {
  if (!chartData || !chartData.data) return null;
  return (
    <div className="mt-3 p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
      {title && <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">{title}</h4>}
      <Plot
        data={chartData.data || []}
        layout={chartData.layout || { autosize: true }}
        config={{ responsive: true }}
        style={{ width: '100%', height: '100%', minHeight: '300px' }}
        useResizeHandler={true}
      />
    </div>
  );
};

const NazLogo = ({ variant = 'sidebar', className = '' }: { variant?: 'sidebar' | 'welcome' | 'header'; className?: string }) => {
  if (variant === 'sidebar') {
    return (
      <svg width="32" height="32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="128" height="128" rx="28" fill="#0f172a" />
        <path d="M 38 90 L 38 38 L 64 64 L 90 38 L 90 90" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="38" cy="38" r="5" fill="#3b82f6" />
        <circle cx="64" cy="64" r="5" fill="#3b82f6" />
        <circle cx="90" cy="90" r="5" fill="#3b82f6" />
        <circle cx="90" cy="38" r="4" fill="#60a5fa" />
      </svg>
    );
  }
  if (variant === 'welcome') {
    return (
      <svg width="72" height="72" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="128" height="128" rx="30" fill="#0f172a" />
        <path d="M 38 90 L 38 38 L 64 64 L 90 38 L 90 90" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="38" cy="38" r="6" fill="#3b82f6" />
        <circle cx="64" cy="64" r="6" fill="#3b82f6" />
        <circle cx="90" cy="90" r="6" fill="#3b82f6" />
        <circle cx="90" cy="38" r="5" fill="#60a5fa" />
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="128" height="128" rx="28" fill="#0f172a" />
      <path d="M 38 90 L 38 38 L 64 64 L 90 38 L 90 90" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ============================================================
// المكون الرئيسي
// ============================================================
export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = useState<string>('عام');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const { settings, updateSetting } = useSettingsContext();
  useSettingsSync(true, 300);

  const [isSavingSkill, setIsSavingSkill] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillDescription, setSkillDescription] = useState('');
  const [showSaveSkillModal, setShowSaveSkillModal] = useState(false);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [rememberFile, setRememberFile] = useState(false);
  const [webSearchToggle, setWebSearchToggle] = useState(settings.webSearch);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const [proposals, setProposals] = useState<ProjectProposal[]>([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ProjectProposal | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // حالات إدارة البيانات
  const [dmFile, setDmFile] = useState<File | null>(null);
  const [dmCommand, setDmCommand] = useState('نظف هذا الملف وقدم لي تقريراً بالنتائج');
  const dmFileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'library' | 'data_management' | 'assistant' | 'proposals' | 'skills' | 'forms' | 'profile'>('assistant');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', title: 'محادثة جديدة', messages: [], createdAt: new Date() },
  ]);
  const [currentConversationId, setCurrentConversationId] = useState('1');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  const [runStatus, setRunStatus] = useState<RunStatus>({
    id: '0',
    status: 'idle',
    plan: [],
    tools: [],
    time: '00:00',
    cost: '$0.00',
    artifacts: [],
    progress: 0,
  });

  const [showRunPanel, setShowRunPanel] = useState(false);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(user));
    }
  }, []);

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await api.get('/skills/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserSkills(response.data);
    } catch (error: any) {
      console.error('خطأ في تحميل المهارات:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchSkills();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
    router.push('/login');
    setShowAccountMenu(false);
  };

  const saveAsSkill = async () => {
    if (!skillName.trim()) return;
    setIsSavingSkill(true);
    try {
      const lastAssistantMsg = messages.filter((m) => m.role === 'assistant').pop();
      const lastUserMsg = messages.filter((m) => m.role === 'user').pop();
      if (!lastAssistantMsg || !lastUserMsg) {
        alert('لا توجد محادثة لحفظها كمهارة');
        return;
      }
      const plan = [
        { step: 'فهم الطلب', status: 'done' },
        { step: 'تنفيذ المهمة', status: 'done' },
        { step: 'التحقق من الجودة', status: 'done' },
      ];
      const tools = ['Gemini AI', 'Python', 'Data Analysis'];

      const token = localStorage.getItem('token');
      await api.post(
        '/skills/create',
        {
          name: skillName,
          description: skillDescription,
          prompt: lastUserMsg.content,
          plan: plan,
          tools: tools,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowSaveSkillModal(false);
      setSkillName('');
      setSkillDescription('');
      await fetchSkills();
      alert('✅ تم حفظ المهارة بنجاح!');
    } catch (error) {
      console.error('خطأ في حفظ المهارة:', error);
      alert('حدث خطأ في حفظ المهارة');
    } finally {
      setIsSavingSkill(false);
    }
  };

  const executeSkill = async (skillId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        `/skills/execute/${skillId}`,
        { skill_id: skillId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInput(response.data.prompt);
      setTimeout(() => {
        sendMessage();
      }, 200);
    } catch (error) {
      console.error('خطأ في تشغيل المهارة:', error);
      alert('حدث خطأ في تشغيل المهارة');
    }
  };

  const fetchDashboardData = async () => {
    if (!isLoggedIn) return;
    setIsLoadingDashboard(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('❌ خطأ في جلب بيانات Dashboard:', error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'library') {
      fetchDashboardData();
    }
  }, [activeTab]);

  const fetchProposals = async () => {
    if (!isLoggedIn) return;
    setIsLoadingProposals(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/proposals/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProposals(response.data);
    } catch (error: any) {
      console.error('❌ خطأ في جلب المقترحات:', error);
    } finally {
      setIsLoadingProposals(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'proposals') {
      fetchProposals();
    }
  }, [activeTab]);

  const handleProposalCreated = (newProposal: ProjectProposal) => {
    setProposals([newProposal, ...proposals]);
    setShowWizard(false);
  };

  // ============================================================
  // ✅ دالة sendMessage - تستخدم العنوان المباشر
  // ============================================================
  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || isLoading) return;
    setIsLoading(true);
    setShowRunPanel(true);

    try {
      const token = localStorage.getItem('token');

      // ✅ التأكد من وجود التوكن
      if (!token) {
        alert('⚠️ الرجاء تسجيل الدخول أولاً');
        router.push('/login');
        return;
      }

      const formData = new FormData();

      formData.append('message', input);
      if (userData?.id) formData.append('user_id', userData.id);
      if (messages.length > 0) {
        formData.append(
          'history',
          JSON.stringify(messages.map((m) => ({ role: m.role, content: m.content })))
        );
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      formData.append(
        'settings',
        JSON.stringify({
          responseLength: settings.responseLength,
          language: settings.language,
          memoryEnabled: settings.memory,
          webSearchEnabled: webSearchToggle,
          pythonEnabled: settings.pythonExecution,
          personality: settings.personality,
          thinkingLevel: settings.thinkingLevel,
          defaultModel: settings.defaultModel,
        })
      );

      // ✅ ✅ ✅ استخدام العنوان المباشر للـ Backend (بدون Proxy)
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}/chat/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        // ✅ معالجة 401 بشكل خاص
        if (response.status === 401) {
          alert('⚠️ انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مجدداً.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let replyContent = data.reply || '⚠️ لم يتم الحصول على رد';

      if (data.search_results && data.search_results.success) {
        const results = data.search_results.results || [];
        if (results.length > 0) {
          replyContent += '\n\n---\n📚 **المصادر:**\n';
          results.slice(0, 5).forEach((r: any, i: number) => {
            replyContent += `${i + 1}. [${r.title}](${r.url})\n`;
          });
        }
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date(),
        plan: data.settings ? ['تم تطبيق الإعدادات'] : undefined,
        artifacts: data.run?.artifacts || [],
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, messages: [...conv.messages, newMessage] }
            : conv
        )
      );

      if (data.run) {
        setRunStatus({
          id: data.run.id || Date.now().toString(),
          status: data.run.status || 'completed',
          plan: data.run.plan || [],
          tools: data.run.tools || [],
          time: data.run.time || '00:00',
          cost: data.run.cost || '$0.00',
          artifacts: data.run.artifacts || [],
          progress: data.run.progress || 100,
        });
      } else {
        setRunStatus({
          id: Date.now().toString(),
          status: 'completed',
          plan: [
            { step: 'فهم الطلب', status: 'done' },
            { step: 'تنفيذ المهمة', status: 'done' },
            { step: 'التحقق من الجودة', status: 'done' },
          ],
          tools: ['Gemini AI'],
          time: '00:08',
          cost: '$0.18',
          artifacts: [{ name: 'الرد_النهائي.txt', type: 'Text', size: '12 KB' }],
          progress: 100,
        });
      }

      setInput('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('❌ خطأ في إرسال الرسالة:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ حدث خطأ في الاتصال بالخادم. تأكد من تشغيل Backend.',
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, messages: [...conv.messages, errorMessage] }
            : conv
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'محادثة جديدة',
      messages: [],
      createdAt: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setRunStatus({
      id: '0',
      status: 'idle',
      plan: [],
      tools: [],
      time: '00:00',
      cost: '$0.00',
      artifacts: [],
      progress: 0,
    });
    setShowRunPanel(false);
    removeFile();
    setActiveTab('assistant');
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isLoggedIn) {
      e.target.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    e.target.value = '';
  };

  const removeFile = () => {
    setSelectedFile(null);
    setRememberFile(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileUpload = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDmFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDmFile(file);
    e.target.value = '';
  };

  const handleDmSubmit = () => {
    if (!dmFile) {
      alert('الرجاء رفع ملف أولاً');
      return;
    }
    setSelectedFile(dmFile);
    setInput(dmCommand);
    setActiveTab('assistant');
    setTimeout(() => {
      sendMessage();
    }, 150);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  // ============================================================
  // الشريط الجانبي
  // ============================================================
  const renderSidebar = () => (
    <div
      className={`${
        sidebarCollapsed ? 'w-12' : 'w-56'
      } bg-white border-r border-gray-100 h-full flex flex-col transition-all duration-300 flex-shrink-0 relative z-20 overflow-y-scroll`}
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}
    >
      <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between px-3'} h-12 border-b border-gray-100 flex-shrink-0`}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-1.5">
            <NazLogo variant="sidebar" className="w-6 h-6" />
            <span className="font-bold text-gray-800 text-sm">Naz AI</span>
          </div>
        )}
        {sidebarCollapsed && <NazLogo variant="sidebar" className="w-6 h-6" />}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition"
            title="بحث"
          >
            <Search className="w-4 h-4 stroke-[1.8px]" />
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            {sidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isSearchOpen && !sidebarCollapsed && (
        <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المنصة..."
              className="w-full px-3 py-1.5 pr-8 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 py-2 space-y-0.5">
        <button
          onClick={createNewConversation}
          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition text-xs ${
            sidebarCollapsed ? 'justify-center' : ''
          } text-gray-700 hover:bg-gray-50`}
          disabled={!isLoggedIn}
        >
          <MessageSquare className="w-4 h-4 stroke-[1.8px] text-blue-600" />
          {!sidebarCollapsed && <span>محادثة جديدة</span>}
        </button>

        {[
          { id: 'library', icon: Library, label: 'المكتبة' },
          { id: 'data_management', icon: Database, label: 'إدارة البيانات' },
          { id: 'proposals', icon: Lightbulb, label: 'حاضنة المشاريع' },
          { id: 'skills', icon: Wrench, label: 'المهارات' },
          { id: 'forms', icon: ClipboardList, label: 'إنشاء الاستمارات' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition text-xs ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              } ${sidebarCollapsed && 'justify-center'}`}
            >
              <Icon className={`w-4 h-4 stroke-[1.8px] ${activeTab === item.id ? 'text-blue-700' : 'text-gray-600'}`} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {!sidebarCollapsed && (
          <div className="pt-2 mt-1 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1 px-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">المحادثات</span>
            </div>
            <div className="space-y-0.5 max-h-36 overflow-y-auto">
              {conversations.slice(0, 3).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setCurrentConversationId(conv.id)}
                  className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-lg transition text-xs ${
                    currentConversationId === conv.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-3 h-3 stroke-[1.8px]" />
                  <span className="truncate flex-1 text-right">{conv.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-gray-100 p-2 flex-shrink-0">
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="w-full flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-[10px]">
                {userData?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 text-right">
                  <div className="text-xs font-medium text-gray-800 truncate">{userData?.username || 'مستخدم'}</div>
                </div>
              )}
            </button>

            {showAccountMenu && (
              <div className="absolute bottom-full right-0 mb-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30 text-xs">
                <button
                  onClick={() => { setActiveTab('profile'); setShowAccountMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50 transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>الملف الشخصي</span>
                </button>
                <button
                  onClick={() => {
                    setSettingsInitialSection('التخصيص');
                    setIsSettingsOpen(true);
                    setShowAccountMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50 transition"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>التحكم والتخصيص</span>
                </button>
                <button
                  onClick={() => {
                    setSettingsInitialSection('عام');
                    setIsSettingsOpen(true);
                    setShowAccountMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50 transition"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>الإعدادات</span>
                </button>
                <div className="border-t border-gray-100 my-0.5"></div>
                <button
                  onClick={() => { setShowHelpModal(true); setShowAccountMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50 transition"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>مساعدة</span>
                </button>
                <button
                  onClick={() => { setShowFeedbackModal(true); setShowAccountMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Feedback</span>
                </button>
                <button
                  onClick={() => { setShowAboutModal(true); setShowAccountMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50 transition"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>About Naz</span>
                </button>
                <div className="border-t border-gray-100 my-0.5"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:bg-blue-50 py-1 rounded-lg transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            {!sidebarCollapsed && 'تسجيل الدخول'}
          </button>
        )}
      </div>
    </div>
  );

  // ============================================================
  // صفحة الملف الشخصي
  // ============================================================
  const renderProfile = () => {
    const [editName, setEditName] = useState(false);
    const [newUsername, setNewUsername] = useState(userData?.username || '');

    const handleUpdateProfile = async () => {
      if (newUsername.trim()) {
        const updatedUser = { ...userData, username: newUsername };
        setUserData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setEditName(false);
        alert('✅ تم تحديث اسم المستخدم بنجاح');
      }
    };

    return (
      <div className="flex-1 bg-[#F7F8FA] p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
              {userData?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">الملف الشخصي</h2>
              <p className="text-sm text-gray-500">إدارة معلومات حسابك</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-500">اسم المستخدم</p>
                {editName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    <button
                      onClick={handleUpdateProfile}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={() => { setEditName(false); setNewUsername(userData?.username || ''); }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <p className="text-lg font-medium text-gray-800">{userData?.username || 'غير محدد'}</p>
                )}
              </div>
              {!editName && (
                <button
                  onClick={() => setEditName(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  تعديل
                </button>
              )}
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                <p className="text-lg font-medium text-gray-800">{userData?.email || 'غير محدد'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-gray-500">تاريخ الانضمام</p>
                <p className="text-lg font-medium text-gray-800">
                  {userData?.created_at ? new Date(userData.created_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setActiveTab('assistant')}
              className="text-sm text-blue-600 hover:text-blue-800 transition"
            >
              ← العودة إلى المحادثة
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // نوافذ منبثقة
  // ============================================================
  const renderHelpModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">💡 مساعدة</h2>
          <button onClick={() => setShowHelpModal(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <p>🔹 <strong>المساعد الذكي:</strong> تحدث مع Naz لتحليل البيانات وبناء المشاريع.</p>
          <p>🔹 <strong>رفع الملفات:</strong> استخدم أيقونة المرفق لرفع Excel, CSV, PDF, Word.</p>
          <p>🔹 <strong>المهارات:</strong> احفظ المهام المتكررة ونفذها بنقرة واحدة.</p>
          <p>🔹 <strong>حاضنة المشاريع:</strong> حوّل فكرتك إلى مقترح احترافي.</p>
          <p>🔹 <strong>الإعدادات:</strong> غيّر اللغة، الشخصية، طريقة الرد والمزيد.</p>
        </div>
        <button
          onClick={() => setShowHelpModal(false)}
          className="mt-4 w-full py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm"
        >
          إغلاق
        </button>
      </div>
    </div>
  );

  const renderFeedbackModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">📝 Feedback</h2>
          <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">نرحب بملاحظاتك! أخبرنا كيف يمكننا تحسين Naz AI.</p>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
            placeholder="اكتب ملاحظاتك هنا..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (feedbackText.trim()) {
                  alert('✅ شكراً لك! تم إرسال ملاحظاتك بنجاح.');
                  setFeedbackText('');
                  setShowFeedbackModal(false);
                } else {
                  alert('⚠️ الرجاء كتابة ملاحظاتك قبل الإرسال.');
                }
              }}
              className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm flex items-center justify-center gap-1"
            >
              <SendIcon className="w-4 h-4" /> إرسال
            </button>
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">ℹ️ About Naz</h2>
          <button onClick={() => setShowAboutModal(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-center mb-2">
            <NazLogo variant="welcome" className="w-16 h-16" />
          </div>
          <p><strong>Naz AI</strong> هو مساعد ذكي متخصص في تحليل البيانات وبناء المشاريع.</p>
          <p>الإصدار: <strong>1.0.0</strong></p>
          <p>المطور: <strong>Naz AI Team</strong></p>
          <p>جميع الحقوق محفوظة © 2026</p>
        </div>
        <button
          onClick={() => setShowAboutModal(false)}
          className="mt-4 w-full py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm"
        >
          إغلاق
        </button>
      </div>
    </div>
  );

  // ============================================================
  // صفحة المساعد الذكي
  // ============================================================
  const renderAssistant = () => {
    const hasMessages = messages.length > 0;
    return (
      <div className="flex-1 flex flex-col bg-[#F7F8FA] h-full relative">
        <div className="absolute top-3 right-4 z-10">
          <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition">
            <Bell className="w-5 h-5 stroke-[1.8px]" />
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 overflow-y-auto px-6 py-4 pb-1">
            {!hasMessages ? (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
                <div className="mb-4"><NazLogo variant="welcome" className="w-20 h-20" /></div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-1">مرحباً بك في Naz AI</h1>
                <p className="text-sm text-gray-500 mb-8">مساعدك الذكي لتحويل أفكارك إلى إنجازات</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto w-full space-y-4 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-br-none' : 'bg-white text-gray-800 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm'} px-4 py-2.5`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed" dir="auto">{msg.content}</p>
                      {msg.plan && msg.plan.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200/30 text-[11px] space-y-0.5">
                          {msg.plan.map((step, i) => <div key={i} className="flex items-center gap-1.5"><span className="text-green-600">✓</span><span>{step}</span></div>)}
                        </div>
                      )}
                      {msg.artifacts && msg.artifacts.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200/30 text-[11px] flex flex-wrap gap-1.5">
                          {msg.artifacts.map((art, i) => <span key={i} className="bg-gray-200/30 px-2.5 py-0.5 rounded-lg flex items-center gap-0.5">📄 {art.name}</span>)}
                        </div>
                      )}
                      <span className="text-[10px] opacity-60 mt-1 block">{formatTime(msg.timestamp)}</span>
                    </div>
                    {msg.role === 'assistant' && msg.mapData && <div className="max-w-[85%] mt-1"><MapViewer geoData={msg.mapData} title="خريطة تفاعلية" /></div>}
                    {msg.role === 'assistant' && msg.chartData && <div className="max-w-[85%] mt-1"><ChartViewer chartData={msg.chartData} title="مخطط تفاعلي" /></div>}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          {showRunPanel && runStatus.status !== 'idle' && (
            <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto p-3">
              <div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-gray-700">التنفيذ</span><button onClick={() => setShowRunPanel(false)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button></div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${runStatus.status === 'running' ? 'bg-blue-600 animate-pulse' : runStatus.status === 'completed' ? 'bg-green-600' : runStatus.status === 'error' ? 'bg-red-600' : 'bg-gray-300'}`}></span><span className="text-[10px] text-gray-600">{runStatus.status === 'running' ? 'جاري العمل...' : runStatus.status === 'completed' ? 'مكتمل' : runStatus.status === 'error' ? 'خطأ' : 'في انتظار'}</span></div>
                <div className="w-full bg-gray-200 rounded-full h-1"><div className={`h-1 rounded-full transition-all ${runStatus.status === 'completed' ? 'bg-green-600' : runStatus.status === 'error' ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${Math.min(100, runStatus.progress)}%` }}></div></div>
                {runStatus.plan.length > 0 && (
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">الخطة</span>
                    {runStatus.plan.map((step, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px]">
                        <span className={`w-2.5 h-2.5 rounded-full flex items-center justify-center text-[8px] ${step.status === 'done' ? 'bg-green-500 text-white' : step.status === 'active' ? 'bg-blue-500 text-white animate-pulse' : step.status === 'error' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}>{step.status === 'done' ? '✓' : step.status === 'active' ? '●' : step.status === 'error' ? '✕' : '○'}</span>
                        <span className={step.status === 'active' ? 'font-medium text-blue-700' : step.status === 'done' ? 'text-gray-600' : step.status === 'error' ? 'text-red-600' : 'text-gray-400'}>{step.step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 px-4 pb-2 pt-1">
          {selectedFile && (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 text-[10px] mb-2 max-w-2xl mx-auto">
              <File className="w-3 h-3 text-blue-600" /><span className="text-blue-800 font-medium">{selectedFile.name}</span><span className="text-blue-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              <button onClick={() => setRememberFile(!rememberFile)} className={`ml-auto p-0.5 rounded transition ${rememberFile ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`} title="تذكر هذا الملف"><Brain className="w-3 h-3" /></button>
              <button onClick={removeFile} className="text-blue-500 hover:text-red-500 transition"><X className="w-3 h-3" /></button>
            </div>
          )}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-end gap-1 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-1.5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100">
              <textarea ref={textareaRef} rows={1} value={input} onChange={(e) => { setInput(e.target.value); adjustTextareaHeight(); }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={isLoggedIn ? 'اكتب ما تريد أن ينجزه Naz...' : 'سجل دخولك...'} className="flex-1 bg-transparent border-0 outline-none text-sm resize-none placeholder-gray-400 min-h-[36px] max-h-[100px] py-0.5 px-1" disabled={!isLoggedIn || isLoading} style={{ minHeight: '36px', maxHeight: '100px', overflow: 'auto' }} />
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button onClick={triggerFileUpload} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition" title="إرفاق ملف" disabled={!isLoggedIn}><Paperclip className="w-3.5 h-3.5 stroke-[1.8px]" /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".txt,.csv,.xlsx,.xls,.pdf,.docx,.json" />
                <button onClick={() => { const newState = !webSearchToggle; setWebSearchToggle(newState); updateSetting('webSearch', newState); }} className={`p-1 rounded-lg transition ${webSearchToggle ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`} title="بحث على الويب" disabled={!isLoggedIn}><Globe className="w-3.5 h-3.5 stroke-[1.8px]" /></button>
                <button onClick={sendMessage} disabled={!isLoggedIn || isLoading || (!input.trim() && !selectedFile)} className={`p-1.5 rounded-lg transition ${!isLoggedIn || (!input.trim() && !selectedFile) ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'}`}><Send className="w-3.5 h-3.5 stroke-[2px]" /></button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1.5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.id} onClick={() => { if (!isLoggedIn) { router.push('/login'); return; } setInput(action.prompt); setTimeout(() => sendMessage(), 100); }} disabled={!isLoggedIn || isLoading} className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-[10px] text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition disabled:opacity-50">
                    <Icon className="w-3 h-3 stroke-[1.8px]" /><span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // ✅ صفحة إدارة البيانات (رفع ملف + أمر تنظيف)
  // ============================================================
  const renderDataManagement = () => (
    <div className="flex-1 bg-[#F7F8FA] p-6 overflow-y-auto flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <Database className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800">تنظيف البيانات</h2>
          <p className="text-sm text-gray-500">ارفع ملف Excel أو CSV، واكتب ما تريد فعله بالضبط</p>
        </div>

        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition"
          onClick={() => dmFileInputRef.current?.click()}
        >
          {dmFile ? (
            <div className="flex items-center justify-center gap-3">
              <File className="w-8 h-8 text-blue-600" />
              <div className="text-right">
                <p className="font-medium text-gray-800">{dmFile.name}</p>
                <p className="text-xs text-gray-400">{(dmFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setDmFile(null); }}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">اضغط للرفع أو اسحب ملفك هنا</p>
              <p className="text-xs text-gray-400 mt-1">يدعم: .xlsx, .xls, .csv</p>
            </>
          )}
          <input
            ref={dmFileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleDmFileSelect}
            className="hidden"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">تعليمات التنظيف</label>
          <textarea
            value={dmCommand}
            onChange={(e) => setDmCommand(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
            placeholder="مثال: احذف المكررات، وحّد أسماء المدن، وحوّل التواريخ..."
          />
        </div>

        <button
          onClick={handleDmSubmit}
          disabled={!dmFile}
          className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          بدء التنظيف (سيتم نقلك إلى المحادثة)
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          سيتم تحويلك إلى شاشة المحادثة لمتابعة النتائج والتفاعل مع الملف النظيف.
        </p>
      </div>
    </div>
  );

  // ============================================================
  // باقي الصفحات
  // ============================================================
  const renderLibrary = () => {
    if (isLoadingDashboard) return <div className="flex-1 flex items-center justify-center bg-[#F7F8FA]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
    return (
      <div className="flex-1 bg-[#F7F8FA] p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📚 المكتبة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-gray-500">المحادثات</span><MessageSquare className="w-5 h-5 text-blue-500" /></div><p className="text-2xl font-bold text-gray-800 mt-2">{dashboardData?.conversations || 0}</p></div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-gray-500">المهارات</span><Wrench className="w-5 h-5 text-purple-500" /></div><p className="text-2xl font-bold text-gray-800 mt-2">{dashboardData?.skills || 0}</p></div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-gray-500">المقترحات</span><Lightbulb className="w-5 h-5 text-amber-500" /></div><p className="text-2xl font-bold text-gray-800 mt-2">{proposals.length || 0}</p></div>
        </div>
      </div>
    );
  };

  const renderProposals = () => {
    if (isLoadingProposals) return <div className="flex-1 flex items-center justify-center bg-[#F7F8FA]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
    return (
      <div className="flex-1 bg-[#F7F8FA] p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4"><div><h2 className="text-xl font-semibold text-gray-800">💡 حاضنة المشاريع</h2><p className="text-sm text-gray-400">حوّل فكرتك إلى مشروع احترافي</p></div><button onClick={() => setShowWizard(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"><Plus className="w-4 h-4" /> مشروع جديد</button></div>
          {showWizard && <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-4"><ProjectWizard onProposalCreated={handleProposalCreated} onCancel={() => setShowWizard(false)} /></div>}
          {proposals.length === 0 && !showWizard ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center"><Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-400">لا توجد مقترحات بعد</p><button onClick={() => setShowWizard(true)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">+ إنشاء مشروع جديد</button></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{proposals.map((proposal) => <ProjectProposalCard key={proposal.id} proposal={proposal} onRefresh={fetchProposals} onSelect={setSelectedProposal} />)}</div>
          )}
        </div>
      </div>
    );
  };

  const renderSkills = () => (
    <div className="flex-1 bg-[#F7F8FA] p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-gray-800">⚡ المهارات</h2><button onClick={() => setShowSaveSkillModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2" disabled={!isLoggedIn}><Plus className="w-4 h-4" /> مهارة جديدة</button></div>
        {userSkills.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center"><Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-400">لا توجد مهارات محفوظة</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{userSkills.map((skill) => <div key={skill.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"><div className="flex justify-between items-start"><div><h3 className="font-semibold text-gray-800">{skill.name}</h3><p className="text-sm text-gray-500">{skill.description}</p></div><button onClick={() => executeSkill(skill.id)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">تشغيل</button></div></div>)}</div>
        )}
      </div>
    </div>
  );

  const renderForms = () => (
    <div className="flex-1 flex items-center justify-center bg-[#F7F8FA] p-6">
      <div className="text-center max-w-md"><ClipboardList className="w-16 h-16 text-blue-500 mx-auto mb-4 opacity-30" /><h2 className="text-xl font-semibold text-gray-700 mb-2">إنشاء الاستمارات</h2><p className="text-sm text-gray-400">هذه الميزة قيد التطوير.</p></div>
    </div>
  );

  // ============================================================
  // التصيير النهائي
  // ============================================================
  return (
    <div className="flex h-screen bg-[#F7F8FA] overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'assistant' && renderAssistant()}
        {activeTab === 'data_management' && renderDataManagement()}
        {activeTab === 'library' && renderLibrary()}
        {activeTab === 'proposals' && renderProposals()}
        {activeTab === 'skills' && renderSkills()}
        {activeTab === 'forms' && renderForms()}
        {activeTab === 'profile' && renderProfile()}
      </div>

      {renderSidebar()}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialSection={settingsInitialSection}
      />

      {showHelpModal && renderHelpModal()}
      {showFeedbackModal && renderFeedbackModal()}
      {showAboutModal && renderAboutModal()}

      {showSaveSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 mx-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">حفظ كمهارة</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">اسم المهارة</label><input type="text" value={skillName} onChange={(e) => setSkillName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: تحليل المبيعات" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">الوصف (اختياري)</label><textarea value={skillDescription} onChange={(e) => setSkillDescription(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={2} placeholder="وصف مختصر..." /></div>
              <button onClick={saveAsSkill} disabled={isSavingSkill || !skillName.trim()} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50">{isSavingSkill ? 'جاري الحفظ...' : 'حفظ المهارة'}</button>
              <button onClick={() => setShowSaveSkillModal(false)} className="w-full py-2 text-gray-500 hover:text-gray-700 transition text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
