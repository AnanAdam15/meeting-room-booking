import { useState, useEffect } from 'react';
import * as userService from '../../services/userService';
import * as departmentService from '../../services/departmentService';
import type { UserData, CreateUserInput } from '../../services/userService';
import type { Department } from '../../services/departmentService';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [type, setType] = useState('staff');
  const [status, setStatus] = useState('active');
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await userService.getAllUsers();
      if (res.success && res.data) setUsers(res.data);
    } catch (err) {
      console.error('โหลดข้อมูลไม่สำเร็จ:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await departmentService.getAllDepartments();
      if (res.success && res.data) setDepartments(res.data);
    } catch (err) {
      console.error('โหลดแผนกไม่สำเร็จ:', err);
    }
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
    if (!email || !firstName || !lastName || !departmentId) {
      setFormError('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }
    if (!editingUser && !password) {
      setFormError('กรุณากรอกรหัสผ่าน');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, {
          email, firstName, lastName,
          phone: phone || undefined,
          position: position || undefined,
          type, status, departmentId,
          password: password || undefined,
        });
      } else {
        await userService.createUser({
          email, password, firstName, lastName,
          phone: phone || undefined,
          position: position || undefined,
          type, departmentId,
        });
      }
      closeForm(); loadUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: UserData) => {
    if (!window.confirm(`ต้องการลบผู้ใช้ "${user.firstName} ${user.lastName}" หรือไม่?`)) return;
    try {
      await userService.deleteUser(user.id);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const getTypeBadge = (t: string) => {
    const config: Record<string, { style: string; label: string }> = {
      admin: { style: 'bg-purple-100 text-purple-700', label: 'ผู้ดูแลระบบ' },
      room_manager: { style: 'bg-blue-100 text-blue-700', label: 'ผู้จัดการห้อง' },
      staff: { style: 'bg-gray-100 text-gray-600', label: 'พนักงาน' },
    };
    const c = config[t] || { style: 'bg-gray-100 text-gray-500', label: t };
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${c.style}`}>{c.label}</span>;
  };

  const getStatusBadge = (s: string) => {
    return s === 'active'
      ? <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">ใช้งาน</span>
      : <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">ระงับ</span>;
  };

  // ค้นหา
  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.department.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">กำลังโหลดข้อมูล...</div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการผู้ใช้</h1>
          <p className="text-gray-500 mt-1">ทั้งหมด {users.length} คน</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
          + เพิ่มผู้ใช้
        </button>
      </div>

      {/* ค้นหา */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ค้นหาชื่อ, อีเมล, แผนก..."
          className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
            </h2>
            {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ *</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล *</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่าน {editingUser ? '(เว้นว่างถ้าไม่เปลี่ยน)' : '*'}
                </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!editingUser} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
                  <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">แผนก *</label>
                  <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">-- เลือกแผนก --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท *</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="staff">พนักงาน</option>
                    <option value="room_manager">ผู้จัดการห้อง</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                </div>
              </div>
              {editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="active">ใช้งาน</option>
                    <option value="inactive">ระงับ</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
                  {isSubmitting ? 'กำลังบันทึก...' : editingUser ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}
                </button>
                <button type="button" onClick={closeForm} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ตาราง */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ชื่อ-นามสกุล</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">อีเมล</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">แผนก</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">บทบาท</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">สถานะ</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                    {user.position && <div className="text-xs text-gray-400">{user.position}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600">{user.department.name}</td>
                  <td className="px-4 py-3 text-center">{getTypeBadge(user.type)}</td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(user.status)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(user)} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">แก้ไข</button>
                      <button onClick={() => handleDelete(user)} className="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition">ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;