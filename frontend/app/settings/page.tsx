// app/settings/page.tsx
'use client';

import { useState } from 'react';
import SettingsModal from '@/components/settings/SettingsModal';

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
      {!isOpen && (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">⚙️ الإعدادات</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            فتح الإعدادات
          </button>
        </div>
      )}
    </div>
  );
}
