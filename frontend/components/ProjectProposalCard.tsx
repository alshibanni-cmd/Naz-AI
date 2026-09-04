'use client';

import { useState } from 'react';
import { Lightbulb, FileText, Calendar, Users, Target, Trash2, Download, Eye, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface ProjectProposalCardProps {
  proposal: any;
  onRefresh: () => void;
  onSelect: (proposal: any) => void;
}

export default function ProjectProposalCard({ proposal, onRefresh, onSelect }: ProjectProposalCardProps) {
  const [loading, setLoading] = useState(false);
  const [showProposal, setShowProposal] = useState(false);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-600',
    analyzing: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
  };

  const statusLabels = {
    draft: 'مسودة',
    analyzing: 'قيد التحليل',
    completed: 'مكتمل',
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        `/proposals/${proposal.id}/generate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onRefresh();
      setShowProposal(true);
      onSelect(response.data);
    } catch (error) {
      console.error('❌ خطأ في توليد المقترح:', error);
      alert('حدث خطأ في توليد المقترح.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المقترح؟')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/proposals/${proposal.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onRefresh();
    } catch (error) {
      console.error('❌ خطأ في حذف المقترح:', error);
      alert('حدث خطأ في حذف المقترح.');
    }
  };

  const handleView = () => {
    setShowProposal(!showProposal);
    if (!showProposal) onSelect(proposal);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-800">{proposal.name}</h3>
          </div>
          {proposal.description && (
            <p className="text-sm text-gray-500 mt-1">{proposal.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {proposal.sector && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{proposal.sector}</span>
            )}
            {proposal.target_group && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                <Users className="w-3 h-3" />
                {proposal.target_group}
              </span>
            )}
            {proposal.target_count && (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                <Target className="w-3 h-3" />
                {proposal.target_count} مستهدف
              </span>
            )}
            <span
              className={`text-xs px-2 py-1 rounded-full ${statusColors[proposal.status as keyof typeof statusColors]}`}
            >
              {statusLabels[proposal.status as keyof typeof statusLabels]}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(proposal.created_at).toLocaleDateString('ar-EG')}
            </span>
            {proposal.components && (
              <span>{proposal.components.length} مكونات</span>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {proposal.status === 'completed' ? (
            <button
              onClick={handleView}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="عرض المقترح"
            >
              <Eye className="w-4 h-4" />
            </button>
          ) : proposal.status === 'draft' && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              title="توليد المقترح"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showProposal && proposal.generated_proposal && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 max-h-96 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            {proposal.generated_proposal.split('\n').map((line: string, i: number) => (
              <p key={i} className="text-gray-700 text-sm">{line}</p>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-1">
              <Download className="w-4 h-4" />
              تحميل PDF
            </button>
            <button
              onClick={() => setShowProposal(false)}
              className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}