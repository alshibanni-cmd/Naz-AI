'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/axios';
import { LogIn, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ استخدام المسار النسبي عبر axios (baseURL = http://127.0.0.1:8000)
            const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token, user } = response.data;

      // حفظ التوكن وبيانات المستخدم
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      // التوجيه إلى الصفحة الرئيسية
      router.push('/');
    } catch (err: any) {
      console.error('❌ خطأ في تسجيل الدخول:', err);
      if (err.response?.status === 401) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      } else if (err.response?.status === 404) {
        setError('الخادم غير متاح. تأكد من تشغيل Backend على المنفذ 8000');
      } else {
        setError(err.response?.data?.detail || 'حدث خطأ أثناء تسجيل الدخول');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Naz AI</h1>
          <p className="text-gray-500 text-sm mt-1">تسجيل الدخول إلى حسابك</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم المستخدم
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="أدخل اسم المستخدم"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="أدخل كلمة المرور"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              'جاري تسجيل الدخول...'
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                تسجيل الدخول
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ليس لديك حساب؟{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}