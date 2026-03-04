import { useState, useEffect } from 'react';
import * as userService from '../../services/userService';
import * as departmentService from '../../services/departmentService';
import type { UserData, } from '../../services/userService';
import type { Department } from '../../services/departmentService';
import { PageTransition } from '../../components/animations';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [type, setType] = useState('staff');
  const [status, setStatus] = useState('active');
  const [departmentId, setDepartmentId] = useState('');
  

  useEffect(() => { loadUsers(); loadDepartments(); }, []);

  const loadUsers = async () => {
    try {
      const res = await userService.getAllUsers();
      if (res.success && res.data) setUsers(res.data);
    } catch (err) { console.error('โหลดข้อมูลไม่สำเร็จ:', err); }
    finally { setIsLoading(false); }
  };

  const loadDepartments = async () => {
    try {
      const res = await departmentService.getAllDepartments();
      if (res.success && res.data) setDepartments(res.data);
    } catch (err) { console.error('โหลดแผนกไม่สำเร็จ:', err); }
  };

  const resetForm = () => {
    setEmail(''); setPassword(''); setFirstName(''); setLastName('');
    setPhone(''); setPosition(''); setType('staff'); setStatus('active'); setDepartmentId(''); setFormError('');
  };

  const openAdd = () => { setEditingUser(null); resetForm(); setShowForm(true); };

  const openEdit = (user: UserData) => {
    setEditingUser(user);
    setEmail(user.email); setFirstName(user.firstName); setLastName(user.lastName);
    setPhone(user.phone || ''); setPosition(user.position || '');
    setType(user.type); setStatus(user.status); setDepartmentId(user.departmentId);
    setPassword(''); setFormError('');
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingUser(null); resetForm(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !departmentId) { setFormError('กรุณากรอกข้อมูลที่จำเป็น'); return; }
    if (!editingUser && !password) { setFormError('กรุณากรอกรหัสผ่าน'); return; }
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, {
          email, firstName, lastName, phone: phone || undefined, position: position || undefined,
          type, status, departmentId, password: password || undefined,
        });
      } else {
        await userService.createUser({
          email, password, firstName, lastName, phone: phone || undefined,
          position: position || undefined, type, departmentId,
        });
      }
      closeForm(); loadUsers();
    } catch (err: any) { setFormError(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    finally { setIsSubmitting(false); }
  };

  const openDeleteModal = (user: UserData) => { setDeletingUser(user); setShowDeleteModal(true); };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await userService.deleteUser(deletingUser.id);
      setShowDeleteModal(false); setDeletingUser(null); loadUsers();
    } catch (err: any) { alert(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const getTypeBadge = (t: string) => {
    const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      admin: { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-500', label: 'ผู้ดูแลระบบ' },
      approver: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', label: 'ผู้อนุมัติ' },
      staff: { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400', label: 'พนักงาน' },
    };
    const c = config[t] || { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400', label: t };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    );
  };

  const getStatusBadge = (s: string) => {
    return s === 'active' ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-600">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ใช้งาน
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-red-50 text-red-600">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> ระงับ
      </span>
    );
  };

  const getAvatarColor = (t: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-violet-100 text-violet-600',
      approver: 'bg-amber-100 text-amber-600',
      staff: 'bg-teal-50 text-teal-600',
    };
    return colors[t] || 'bg-slate-100 text-slate-500';
  };

  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.department.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

return (
  <PageTransition>
  <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-teal-600 font-medium mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            จัดการผู้ใช้
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ผู้ใช้ทั้งหมด</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} คน</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          เพิ่มผู้ใช้
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="ค้นหาชื่อ, อีเมล, แผนก..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm" />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingUser ? 'bg-amber-50' : 'bg-teal-50'}`}>
                {editingUser ? (
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</h2>
                <p className="text-xs text-slate-400">{editingUser ? 'แก้ไขข้อมูลผู้ใช้' : 'กรอกข้อมูลผู้ใช้ใหม่'}</p>
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">ชื่อ <span className="text-red-400">*</span></label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">นามสกุล <span className="text-red-400">*</span></label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">อีเมล <span className="text-red-400">*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  รหัสผ่าน {editingUser ? <span className="text-slate-400 font-normal">(เว้นว่างถ้าไม่เปลี่ยน)</span> : <span className="text-red-400">*</span>}
                </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!editingUser} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">เบอร์โทร</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">ตำแหน่ง</label>
                  <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">แผนก <span className="text-red-400">*</span></label>
                  <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required className={`${inputClass} appearance-none`}>
                    <option value="">-- เลือกแผนก --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">บทบาท <span className="text-red-400">*</span></label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="staff">พนักงาน</option>
                    <option value="approver">ผู้อนุมัติ</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                </div>
              </div>
              {editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">สถานะ</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="active">ใช้งาน</option>
                    <option value="inactive">ระงับ</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-3">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition text-sm disabled:opacity-50 shadow-lg shadow-teal-600/20">
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      กำลังบันทึก...
                    </span>
                  ) : editingUser ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}
                </button>
                <button type="button" onClick={closeForm} className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">ลบผู้ใช้</h2>
            <p className="text-slate-400 text-sm mb-1">ต้องการลบผู้ใช้</p>
            <p className="text-slate-700 font-semibold text-sm mb-5">"{deletingUser.firstName} {deletingUser.lastName}"</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm">ยืนยันลบ</button>
              <button onClick={() => { setShowDeleteModal(false); setDeletingUser(null); }} className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
          </div>
          <p className="text-slate-400 text-sm">{searchTerm ? 'ไม่พบผู้ใช้ที่ค้นหา' : 'ยังไม่มีผู้ใช้ในระบบ'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">ชื่อ-นามสกุล</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">อีเมล</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">แผนก</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">บทบาท</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">สถานะ</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(user.type)}`}>
                          <span className="text-xs font-semibold">{user.firstName.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-700">{user.firstName} {user.lastName}</div>
                          {user.position && <div className="text-xs text-slate-400">{user.position}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{user.email}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                        {user.department.name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">{getTypeBadge(user.type)}</td>
                    <td className="px-4 py-3.5 text-center">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => openEdit(user)} className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 border border-amber-100 transition font-medium">แก้ไข</button>
                        <button onClick={() => openDeleteModal(user)} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 transition font-medium">ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
   </div>
  </PageTransition>
);
};

export default AdminUsersPage;