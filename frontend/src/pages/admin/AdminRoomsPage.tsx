import { useState, useEffect, useRef } from 'react';
import type { Room, CreateRoomInput } from '../../types/room';
import * as roomService from '../../services/roomService';
import * as equipmentService from '../../services/equipmentService';
import type { Equipment, RoomEquipment } from '../../services/equipmentService';
import type { RoomManager } from '../../services/roomService';
import { PageTransition, StaggerContainer, StaggerItem } from '../../components/animations';

const AdminRoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('available');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [managers, setManagers] = useState<RoomManager[]>([]);
  const [managerId, setManagerId] = useState('');

  const [allEquipments, setAllEquipments] = useState<Equipment[]>([]);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedRoomForEquip, setSelectedRoomForEquip] = useState<Room | null>(null);
  const [, setRoomEquipments] = useState<RoomEquipment[]>([]);
  const [selectedEquipIds, setSelectedEquipIds] = useState<Record<string, number>>({});
  const [newEquipName, setNewEquipName] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [showDeleteEquipModal, setShowDeleteEquipModal] = useState(false);
  const [deletingEquipId, setDeletingEquipId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => { loadRooms(); loadAllEquipments(); loadManagers(); }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadRooms = async () => {
    try {
      const response = await roomService.getAllRooms();
      if (response.success && response.data) setRooms(response.data);
    } catch (error) { console.error('โหลดข้อมูลไม่สำเร็จ:', error); }
    finally { setIsLoading(false); }
  };

  const loadAllEquipments = async () => {
    try {
      const response = await equipmentService.getAllEquipments();
      if (response.success && response.data) setAllEquipments(response.data);
    } catch (error) { console.error('โหลดอุปกรณ์ไม่สำเร็จ:', error); }
  };

  const loadManagers = async () => {
    try {
      const response = await roomService.getRoomManagers();
      if (response.success && response.data) setManagers(response.data);
    } catch (error) { console.error('โหลดผู้ดูแลไม่สำเร็จ:', error); }
  };

  const openAddForm = () => {
    setEditingRoom(null); setName(''); setLocation(''); setCapacity(10); setDescription(''); setStatus('available'); setManagerId(''); setFormError(''); setShowForm(true);
  };

  const openEditForm = (room: Room) => {
    setEditingRoom(room); setName(room.name); setLocation(room.location); setCapacity(room.capacity);
    setDescription(room.description || ''); setStatus(room.status); setManagerId(room.managerId || ''); setFormError(''); setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingRoom(null); setFormError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    if (!name || !location || !capacity) { setFormError('กรุณากรอกข้อมูลให้ครบ'); return; }
    setIsSubmitting(true);
    try {
      if (editingRoom) {
        await roomService.updateRoom(editingRoom.id, { name, location, capacity, description: description || undefined, status, managerId: managerId || undefined });
      } else {
        const input: CreateRoomInput = { name, location, capacity, description: description || undefined, managerId: managerId || undefined };
        await roomService.createRoom(input);
      }
      closeForm(); loadRooms();
      setNotification({ type: 'success', message: editingRoom ? 'แก้ไขห้องสำเร็จ' : 'เพิ่มห้องสำเร็จ' });
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally { setIsSubmitting(false); }
  };

  const openDeleteModal = (room: Room) => { setDeletingRoom(room); setShowDeleteModal(true); };

  const handleDelete = async () => {
    if (!deletingRoom) return;
    try {
      await roomService.deleteRoom(deletingRoom.id);
      setShowDeleteModal(false); setDeletingRoom(null); loadRooms();
      setNotification({ type: 'success', message: 'ลบห้องประชุมสำเร็จ' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'เกิดข้อผิดพลาด' });
    }
  };

  const handleUploadClick = (roomId: string) => { setUploadingId(roomId); fileInputRef.current?.click(); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) return;
    try { await roomService.uploadRoomImage(uploadingId, file); loadRooms(); setNotification({ type: 'success', message: 'อัพโหลดรูปสำเร็จ' }); }
    catch (err: any) { setNotification({ type: 'error', message: err.response?.data?.message || 'อัพโหลดไม่สำเร็จ' }); }
    finally { setUploadingId(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const openEquipmentModal = async (room: Room) => {
    setSelectedRoomForEquip(room); setShowEquipmentModal(true);
    try {
      const response = await equipmentService.getRoomEquipments(room.id);
      if (response.success && response.data) {
        setRoomEquipments(response.data);
        const selected: Record<string, number> = {};
        response.data.forEach((re) => { selected[re.equipmentId] = re.quantity; });
        setSelectedEquipIds(selected);
      }
    } catch (error) { console.error('โหลดอุปกรณ์ห้องไม่สำเร็จ:', error); }
  };

  const toggleEquipment = (equipId: string) => {
    setSelectedEquipIds((prev) => {
      const newSelected = { ...prev };
      if (newSelected[equipId]) { delete newSelected[equipId]; } else { newSelected[equipId] = 1; }
      return newSelected;
    });
  };

  const updateQuantity = (equipId: string, qty: number) => {
    if (qty < 1) return;
    setSelectedEquipIds((prev) => ({ ...prev, [equipId]: qty }));
  };

  const saveRoomEquipments = async () => {
    if (!selectedRoomForEquip) return;
    try {
      const equipments = Object.entries(selectedEquipIds).map(([equipmentId, quantity]) => ({ equipmentId, quantity }));
      await equipmentService.setRoomEquipments(selectedRoomForEquip.id, equipments);
      setShowEquipmentModal(false); setSelectedRoomForEquip(null);
      setNotification({ type: 'success', message: 'บันทึกอุปกรณ์สำเร็จ' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'เกิดข้อผิดพลาด' });
    }
  };

  const addNewEquipment = async () => {
    if (!newEquipName.trim()) return;
    try { await equipmentService.createEquipment(newEquipName.trim()); setNewEquipName(''); loadAllEquipments(); }
    catch (err: any) { setNotification({ type: 'error', message: err.response?.data?.message || 'เกิดข้อผิดพลาด' }); }
  };

  const openDeleteEquipModal = (id: string) => { setDeletingEquipId(id); setShowDeleteEquipModal(true); };

  const deleteEquipmentMaster = async () => {
    if (!deletingEquipId) return;
    try { await equipmentService.deleteEquipment(deletingEquipId); setShowDeleteEquipModal(false); setDeletingEquipId(null); loadAllEquipments(); }
    catch (err: any) { setNotification({ type: 'error', message: err.response?.data?.message || 'เกิดข้อผิดพลาด' }); }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      available: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'ว่าง' },
      unavailable: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'ไม่ว่าง' },
      maintenance: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', label: 'ปิดปรับปรุง' },
    };
    const c = config[status] || { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400', label: status };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    );
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    return `http://localhost:5000${imagePath}`;
  };

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
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-teal-600 font-medium mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            จัดการห้องประชุม
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ห้องประชุมทั้งหมด</h1>
          <p className="text-slate-400 text-sm mt-1">{rooms.length} ห้อง</p>
        </div>
        <button onClick={openAddForm} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          เพิ่มห้องประชุม
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`px-4 py-3 rounded-xl mb-4 text-sm flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            )}
            {notification.message}
          </div>
          <button onClick={() => setNotification(null)} className="opacity-50 hover:opacity-100 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Room Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingRoom ? 'bg-amber-50' : 'bg-teal-50'}`}>
                {editingRoom ? (
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{editingRoom ? 'แก้ไขห้องประชุม' : 'เพิ่มห้องประชุมใหม่'}</h2>
                <p className="text-xs text-slate-400">{editingRoom ? 'แก้ไขข้อมูลห้อง' : 'กรอกรายละเอียดห้องประชุม'}</p>
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">ชื่อห้อง <span className="text-red-400">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น ห้องประชุม A" required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">ตำแหน่งที่ตั้ง <span className="text-red-400">*</span></label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="เช่น ชั้น 3 อาคาร B" required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">ความจุ (คน) <span className="text-red-400">*</span></label>
                <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} min={1} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">รายละเอียด</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="อุปกรณ์ในห้อง, หมายเหตุ" rows={3} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">ผู้ดูแลห้อง</label>
                <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className={`${inputClass} appearance-none`}>
                  <option value="">-- ไม่ระบุผู้ดูแล --</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.email})</option>
                  ))}
                </select>
              </div>
              {editingRoom && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">สถานะ</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="available">ว่าง</option>
                    <option value="unavailable">ไม่ว่าง</option>
                    <option value="maintenance">ปิดปรับปรุง</option>
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
                  ) : editingRoom ? 'บันทึกการแก้ไข' : 'เพิ่มห้องประชุม'}
                </button>
                <button type="button" onClick={closeForm} className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && selectedRoomForEquip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.58-3.32a.5.5 0 010-.86l5.58-3.32a.5.5 0 01.75.43v6.64a.5.5 0 01-.75.43zM20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">จัดการอุปกรณ์</h2>
                <p className="text-xs text-slate-400">{selectedRoomForEquip.name}</p>
              </div>
            </div>

            {/* Add new equipment */}
            <div className="bg-slate-50 rounded-xl p-3.5 mb-4 border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">เพิ่มอุปกรณ์ใหม่เข้าระบบ</p>
              <div className="flex gap-2">
                <input type="text" value={newEquipName} onChange={(e) => setNewEquipName(e.target.value)} placeholder="ชื่ออุปกรณ์ เช่น Microphone" className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700 placeholder:text-slate-300"
                  onKeyDown={(e) => e.key === 'Enter' && addNewEquipment()} />
                <button onClick={addNewEquipment} className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition font-medium">เพิ่ม</button>
              </div>
            </div>

            {/* Equipment list */}
            <div className="space-y-2 mb-4">
              {allEquipments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-400">ยังไม่มีอุปกรณ์ในระบบ</p>
                </div>
              ) : (
                allEquipments.map((equip) => (
                  <div key={equip.id} className={`flex items-center gap-3 p-3 rounded-xl border transition ${selectedEquipIds[equip.id] ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-100'}`}>
                    <input type="checkbox" checked={!!selectedEquipIds[equip.id]} onChange={() => toggleEquipment(equip.id)} className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
                    <span className="flex-1 text-sm text-slate-700 font-medium">{equip.name}</span>
                    {selectedEquipIds[equip.id] && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQuantity(equip.id, (selectedEquipIds[equip.id] || 1) - 1)} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition text-sm">-</button>
                        <span className="w-8 text-center text-sm font-medium text-slate-700">{selectedEquipIds[equip.id]}</span>
                        <button onClick={() => updateQuantity(equip.id, (selectedEquipIds[equip.id] || 1) + 1)} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition text-sm">+</button>
                      </div>
                    )}
                    <button onClick={() => openDeleteEquipModal(equip.id)} className="text-slate-400 hover:text-red-500 transition p-1" title="ลบออกจากระบบ">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={saveRoomEquipments} className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition text-sm shadow-lg shadow-teal-600/20">บันทึกอุปกรณ์</button>
              <button onClick={() => { setShowEquipmentModal(false); setSelectedRoomForEquip(null); }} className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Room Modal */}
      {showDeleteModal && deletingRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">ลบห้องประชุม</h2>
            <p className="text-slate-400 text-sm mb-1">ต้องการลบห้อง</p>
            <p className="text-slate-700 font-semibold text-sm mb-5">"{deletingRoom.name}"</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm">ยืนยันลบ</button>
              <button onClick={() => { setShowDeleteModal(false); setDeletingRoom(null); }} className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Equipment Modal */}
      {showDeleteEquipModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">ลบอุปกรณ์</h2>
            <p className="text-slate-400 text-sm mb-5">ต้องการลบอุปกรณ์นี้ออกจากระบบหรือไม่?</p>
            <div className="flex gap-3">
              <button onClick={deleteEquipmentMaster} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm">ยืนยันลบ</button>
              <button onClick={() => { setShowDeleteEquipModal(false); setDeletingEquipId(null); }} className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Room Cards */}
      {rooms.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <p className="text-slate-400 text-sm">ยังไม่มีห้องประชุมในระบบ</p>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <StaggerItem key={room.id}>
            <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
              {/* Room Image */}
              <div className="h-40 bg-gradient-to-br from-teal-500 to-teal-700 relative overflow-hidden">
                {room.image ? (
                  <img src={getImageUrl(room.image)!} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full" />
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                  </>
                )}
                {/* Upload overlay */}
                <button onClick={() => handleUploadClick(room.id)} className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                  <span className="bg-white text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                    {room.image ? 'เปลี่ยนรูป' : 'อัพโหลดรูป'}
                  </span>
                </button>
                {/* Status badge */}
                <div className="absolute top-3 right-3">{getStatusBadge(room.status)}</div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-slate-800 text-base mb-2 group-hover:text-teal-700 transition">{room.name}</h3>
                <div className="space-y-1.5 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    <span>{room.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                    <span>รองรับ {room.capacity} คน</span>
                  </div>
                  {room.manager && (
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span>ผู้ดูแล: {room.manager.firstName} {room.manager.lastName}</span>
                    </div>
                  )}
                  {room.description && (
                    <p className="text-xs text-slate-400 truncate">{room.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openEditForm(room)} className="flex-1 px-3 py-2 text-xs bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 border border-amber-100 transition font-medium">แก้ไข</button>
                  <button onClick={() => openEquipmentModal(room)} className="flex-1 px-3 py-2 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition font-medium flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.58-3.32a.5.5 0 010-.86l5.58-3.32a.5.5 0 01.75.43v6.64a.5.5 0 01-.75.43z" /></svg>
                    อุปกรณ์
                  </button>
                  <button onClick={() => openDeleteModal(room)} className="flex-1 px-3 py-2 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 transition font-medium">ลบ</button>
                </div>
              </div>
         </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
   </div>
    </PageTransition>
  );
};

export default AdminRoomsPage;