'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/register', null, {
        params: { username, email, password },
      });

      setSuccess('✅ تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error: any) {
      console.error('❌ خطأ في التسجيل:', error);

      let errorMessage = 'فشل إنشاء الحساب. تأكد من صحة البيانات.';

      if (error.response) {
        const data = error.response.data;

        if (Array.isArray(data)) {
          if (data.length > 0 && data[0].msg) {
            errorMessage = data[0].msg;
          }
        } else if (data && typeof data === 'object') {
          if (data.detail) {
            if (typeof data.detail === 'string') {
              errorMessage = data.detail;
            } else if (Array.isArray(data.detail)) {
              errorMessage = data.detail.map((d: any) => d.msg || d).join(', ');
            }
          } else if (data.message) {
            errorMessage = data.message;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">إنشاء حساب</h1>
        <p className="text-center text-gray-500 mb-6">انضم إلى Naz AI 🚀</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          لديك حساب بالفعل؟ <a href="/login" className="text-blue-600 hover:underline">تسجيل الدخول</a>
        </p>
      </div>
    </div>
  );
}