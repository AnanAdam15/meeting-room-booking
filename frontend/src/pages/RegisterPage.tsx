import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as authService from '../services/authService';
import * as departmentService from '../services/departmentService';
import type { Department } from '../services/departmentService';
import { FadeIn } from '../components/animations';

const RegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ใช้สำหรับ redirect ถ้า user login อยู่แล้ว

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    departmentService.getAllDepartments().then((res) => {
      if (res.success && res.data) setDepartments(res.data);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !password) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('รูปแบบอีเมลไม่ถูกต้อง'); return; }
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (password !== confirmPassword) { setError('รหัสผ่านไม่ตรงกัน'); return; }
    if (phone && !/^[0-9+\-\s()]{9,15}$/.test(phone)) { setError('รูปแบบเบอร์โทรไม่ถูกต้อง (ตัวเลข 9-15 หลัก)'); return; }

    setIsLoading(true);
    try {
      const res = await authService.register({
        email, password, firstName, lastName,
        phone: phone || undefined,
        position: position || undefined,
        departmentId: departmentId || undefined,
      });
      if (res.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all";

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-b from-teal-600 via-teal-700 to-teal-900">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-white/90 font-semibold text-lg tracking-wide">MeetingRoom</span>
          </div>


          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight mb-5">
              สมัครสมาชิก
              <br />
              เพื่อเริ่มจองห้อง
              <span className="inline-block ml-2 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
            </h1>
            <p className="text-teal-100/80 text-lg leading-relaxed mb-8">
              สร้างบัญชีเพื่อเข้าใช้ระบบจองห้องประชุม
              ภายในโรงพยาบาลได้ทันที
            </p>
            <div className="space-y-4">
              {[
                { icon: '📅', text: 'จองห้องประชุมและตรวจสอบช่วงเวลาว่าง' },
                { icon: '✅', text: 'ระบบอนุมัติคำขอจองอัตโนมัติ' },
                { icon: '📧', text: 'แจ้งเตือนผ่านอีเมลก่อนเวลาประชุม' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-teal-100/70">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-sm border border-white/10">
                    {item.icon}
                  </div>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-teal-200/40 text-xs">Hospital Internal Meeting Room Reservation System</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-10 overflow-y-auto">
        <FadeIn className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-600/25">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800">ระบบจองห้องประชุม</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">สมัครสมาชิก</h2>
            <p className="text-slate-400 text-sm">กรอกข้อมูลเพื่อสร้างบัญชีใหม่</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ชื่อ - นามสกุล */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">ชื่อ <span className="text-red-400">*</span></label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="ชื่อ" required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">นามสกุล <span className="text-red-400">*</span></label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="นามสกุล" required className={inputClass} />
              </div>
            </div>

            {/* อีเมล */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">อีเมล <span className="text-red-400">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@hospital.com" required className={inputClass} />
            </div>

            {/* รหัสผ่าน */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">รหัสผ่าน <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  required
                  className={`${inputClass} pr-12`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition">
                  {showPassword ? (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* ยืนยันรหัสผ่าน */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">ยืนยันรหัสผ่าน <span className="text-red-400">*</span></label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="กรอกรหัสผ่านอีกครั้ง" required className={inputClass} />
            </div>

            {/* แผนก */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">แผนก</label>
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={`${inputClass} appearance-none`}>
                <option value="">-- เลือกแผนก (ไม่บังคับ) --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* เบอร์โทร + ตำแหน่ง */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">เบอร์โทร</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812345678" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">ตำแหน่ง</label>
                <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="เช่น พยาบาล" className={inputClass} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/25 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  กำลังสมัครสมาชิก...
                </span>
              ) : 'สมัครสมาชิก'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login" className="text-teal-600 font-medium hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </FadeIn>
      </div>
    </div>
  );
};

export default RegisterPage;
