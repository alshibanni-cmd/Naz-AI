'use client';

import { useState } from 'react';
import { Lightbulb, Target, Users, CheckCircle, ArrowRight, ArrowLeft, Loader2, X, Sparkles } from 'lucide-react';
import api from '@/lib/axios';

interface ProjectWizardProps {
  onProposalCreated: (proposal: any) => void;
  onCancel: () => void;
}

export default function ProjectWizard({ onProposalCreated, onCancel }: ProjectWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sector: '',
    target_group: '',
    target_count: 0,
    components: [] as string[],
    componentInput: '',
    language: 'ar',
    tone: 'professional',
  });

  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const addComponent = () => {
    if (formData.componentInput.trim()) {
      setFormData({
        ...formData,
        components: [...formData.components, formData.componentInput.trim()],
        componentInput: '',
      });
    }
  };

  const removeComponent = (index: number) => {
    setFormData({
      ...formData,
      components: formData.components.filter((_, i) => i !== index),
    });
  };

  const analyzeIdea = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/proposals/analyze',
        {
          message: `أريد مشروعاً بعنوان "${formData.name}" في قطاع "${formData.sector}" يستهدف "${formData.target_group}"، ومكوناته: ${formData.components.join(', ')}`,
          language: formData.language,
          tone: formData.tone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAnalysis(response.data.analysis);
      nextStep();
    } catch (error) {
      console.error('❌ خطأ في تحليل الفكرة:', error);
      alert('حدث خطأ في تحليل الفكرة. تأكد من تشغيل Backend.');
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/proposals/create',
        {
          name: formData.name,
          description: formData.description,
          sector: formData.sector,
          target_group: formData.target_group,
          target_count: formData.target_count,
          components: formData.components,
          language: formData.language,
          tone: formData.tone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onProposalCreated(response.data);
    } catch (error) {
      console.error('❌ خطأ في إنشاء المقترح:', error);
      alert('حدث خطأ في إنشاء المقترح.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Lightbulb className="w-5 h-5" />
              <span className="font-semibold">المعلومات الأساسية</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المشروع *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="مثال: مركز تدريب تقني متنقل"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وصف مختصر</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows={3}
                placeholder="وصف الفكرة الأساسية..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">القطاع</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">اختر القطاع</option>
                  <option value="تعليمي">تعليمي</option>
                  <option value="صحي">صحي</option>
                  <option value="اقتصادي">اقتصادي</option>
                  <option value="خدمي">خدمي</option>
                  <option value="إنساني">إنساني</option>
                  <option value="تقني">تقني</option>
                  <option value="زراعي">زراعي</option>
                  <option value="استثماري">استثماري</option>
                  <option value="تجاري">تجاري</option>
                  <option value="بحثي">بحثي</option>
                  <option value="تدريبي">تدريبي</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الفئة المستهدفة</label>
                <input
                  type="text"
                  value={formData.target_group}
                  onChange={(e) => setFormData({ ...formData, target_group: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="مثال: شباب 18-30 سنة"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Target className="w-5 h-5" />
              <span className="font-semibold">المكونات والتفاصيل</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عدد المستهدفين (تقديري)</label>
              <input
                type="number"
                value={formData.target_count || ''}
                onChange={(e) => setFormData({ ...formData, target_count: parseInt(e.target.value) || 0 })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="مثال: 500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مكونات المشروع</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.componentInput}
                  onChange={(e) => setFormData({ ...formData, componentInput: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && addComponent()}
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="أضف مكوناً..."
                />
                <button
                  onClick={addComponent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                  إضافة
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.components.map((comp, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {comp}
                    <button onClick={() => removeComponent(i)} className="text-blue-500 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">تحليل الفكرة بواسطة Naz AI</span>
            </div>
            {analysis ? (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-80 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  {analysis.split('\n').map((line, i) => (
                    <p key={i} className="text-gray-700 text-sm">{line}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>اضغط على "تحليل الفكرة" لبدء التحليل الذكي</p>
                <button
                  onClick={analyzeIdea}
                  disabled={loading}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loading ? 'جاري التحليل...' : 'تحليل الفكرة'}
                </button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">إنشاء المقترح</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700">
                ✅ جميع البيانات جاهزة. سيتم إنشاء مقترح احترافي يعتمد على تحليل Naz AI والمعلومات التي قدمتها.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">الاسم:</span>
                <span className="font-medium block">{formData.name}</span>
              </div>
              <div>
                <span className="text-gray-500">القطاع:</span>
                <span className="font-medium block">{formData.sector || 'غير محدد'}</span>
              </div>
              <div>
                <span className="text-gray-500">الفئة المستهدفة:</span>
                <span className="font-medium block">{formData.target_group || 'غير محدد'}</span>
              </div>
              <div>
                <span className="text-gray-500">المكونات:</span>
                <span className="font-medium block">{formData.components.length || 0}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className={`h-2 flex-1 rounded-full ${
                i + 1 <= step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
            {i < totalSteps - 1 && <span className="text-xs text-gray-400">•</span>}
          </div>
        ))}
      </div>

      {renderStep()}

      <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={step === 1 ? onCancel : prevStep}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? 'إلغاء' : 'السابق'}
        </button>
        <button
          onClick={step === totalSteps ? createProposal : step === 3 ? analyzeIdea : nextStep}
          disabled={loading || (step === 1 && !formData.name.trim())}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : step === totalSteps ? (
            <>
              <CheckCircle className="w-4 h-4" />
              إنشاء المقترح
            </>
          ) : (
            <>
              التالي
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}