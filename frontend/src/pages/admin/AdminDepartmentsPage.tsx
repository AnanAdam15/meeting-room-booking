import { useState, useEffect } from 'react';
import * as departmentService from '../../services/departmentService';
import type { Department } from '../../services/departmentService';
import { PageTransition } from '../../components/animations';

const AdminDepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  const openDeleteModal = (dept: Department) => {
    setDeletingDept(dept);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingDept) return;
    setIsDeleting(true);
    try {
      await departmentService.deleteDepartment(deletingDept.id);
      setShowDeleteModal(false);
      setDeletingDept(null);
      setDeleteError('');
      loadDepartments();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsDeleting(false);
    }
  };

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-teal-600 font-medium mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            จัดการแผนก
          </div>
          <h1 className="text-2xl font-bold text-slate-800">แผนกทั้งหมด</h1>
          <p className="text-slate-400 text-sm mt-1">{departments.length} แผนก</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          เพิ่มแผนก
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingDept ? 'bg-amber-50' : 'bg-teal-50'}`}>
                {editingDept ? (
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{editingDept ? 'แก้ไขแผนก' : 'เพิ่มแผนกใหม่'}</h2>
                <p className="text-xs text-slate-400">{editingDept ? 'แก้ไขข้อมูลแผนก' : 'กรอกชื่อแผนกที่ต้องการเพิ่ม'}</p>
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">ชื่อแผนก <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น แผนกเทคโนโลยีสารสนเทศ"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition text-sm disabled:opacity-50 shadow-lg shadow-teal-600/20"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      กำลังบันทึก...
                    </span>
                  ) : editingDept ? 'บันทึกการแก้ไข' : 'เพิ่มแผนก'}
                </button>
                <button type="button" onClick={closeForm} className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium">
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingDept && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">ลบแผนก</h2>
                <p className="text-xs text-slate-400">"{deletingDept.name}"</p>
              </div>
            </div>

            {deleteError ? (
              <>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 mb-4 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">{deleteError}</p>
                </div>
                <button onClick={() => { setShowDeleteModal(false); setDeletingDept(null); setDeleteError(''); }} className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition text-sm font-medium">ปิด</button>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-5">แผนกจะถูกปิดใช้งานและซ่อนจากระบบ ข้อมูลยังคงอยู่ใน Database แผนกที่มีสมาชิกอยู่จะไม่สามารถลบได้</p>
                <div className="flex gap-3">
                  <button onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm disabled:opacity-50">
                    {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
                  </button>
                  <button onClick={() => { setShowDeleteModal(false); setDeletingDept(null); }} className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium">ยกเลิก</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {departments.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">ยังไม่มีแผนกในระบบ</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">ชื่อแผนก</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">จำนวนผู้ใช้</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                        </svg>
                      </div>
                      <span className="font-medium text-slate-700">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      {dept._count?.users || 0} คน
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => openEdit(dept)}
                        className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 border border-amber-100 transition font-medium"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => openDeleteModal(dept)}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 transition font-medium"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
   </div>
    </PageTransition>
  );
};

export default AdminDepartmentsPage;