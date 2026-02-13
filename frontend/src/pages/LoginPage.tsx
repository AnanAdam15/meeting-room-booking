import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/'); // ล็อกอินสำเร็จ → ไปหน้า Dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🏥</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ระบบจองห้องประชุม</h1>
          <p className="text-gray-500 mt-1">โรงพยาบาล - Meeting Room Booking</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@hospital.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* Test Accounts */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">บัญชีทดสอบ</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => { setEmail('admin@hospital.com'); setPassword('password123'); }}
              className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition"
            >
              👨‍💼 <span className="font-medium">Admin:</span> admin@hospital.com
            </button>
            <button
              type="button"
              onClick={() => { setEmail('staff@hospital.com'); setPassword('password123'); }}
              className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition"
            >
              👤 <span className="font-medium">Memmber:</span> staff@hospital.com
            </button>
              <button
              type="button"
              onClick={() => { setEmail('manager@company.com'); setPassword('password123'); }}
              className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition"
            >
             🏢 <span className="font-medium">Approve:</span> manager@company.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;