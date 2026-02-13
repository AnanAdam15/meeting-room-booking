import { useState, useEffect } from 'react';
import * as departmentService from '../../services/departmentService';
import type { Department } from '../../services/departmentService';

const AdminDepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadDepartments(); }, []);

  const loadDepartments = async () => {
    try {
      const res = await departmentService.getAllDepartments();
      if (res.success && res.data) setDepartments(res.data);
    } catch (err) {
      console.error('โหลดข้อมูลไม่สำเร็จ:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openAdd = () => { setEditingDept(null); setName(''); setFormError(''); setShowForm(true); };
  const openEdit = (dept: Department) => { setEditingDept(dept); setName(dept.name); setFormError(''); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingDept(null); setFormError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setFormError('กรุณากรอกชื่อแผนก'); return; }
    setIsSubmitting(true);
    try {
      if (editingDept) {
        await departmentService.updateDepartment(editingDept.id, name.trim());
      } else {
        await departmentService.createDepartment(name.trim());
      }
      closeForm(); loadDepartments();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!window.confirm(`ต้องการลบแผนก "${dept.name}" หรือไม่?`)) return;
    try {
      await departmentService.deleteDepartment(dept.id);
      loadDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">กำลังโหลดข้อมูล...</div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการแผนก</h1>
          <p className="text-gray-500 mt-1">ทั้งหมด {departments.length} แผนก</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
          + เพิ่มแผนก
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingDept ? 'แก้ไขแผนก' : 'เพิ่มแผนกใหม่'}
            </h2>
            {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อแผนก *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น แผนกเทคโนโลยีสารสนเทศ" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
                  {isSubmitting ? 'กำลังบันทึก...' : editingDept ? 'บันทึกการแก้ไข' : 'เพิ่มแผนก'}
                </button>
                <button type="button" onClick={closeForm} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ตาราง */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ชื่อแผนก</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">จำนวนผู้ใช้</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{dept.name}</td>
                <td className="px-4 py-3 text-center text-gray-600">{dept._count?.users || 0} คน</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEdit(dept)} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">แก้ไข</button>
                    <button onClick={() => handleDelete(dept)} className="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition">ลบ</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDepartmentsPage;