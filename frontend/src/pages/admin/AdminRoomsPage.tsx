import { useState, useEffect, useRef } from 'react';
import type { Room, CreateRoomInput } from '../../types/room';
import * as roomService from '../../services/roomService';
import * as equipmentService from '../../services/equipmentService';
import type { Equipment, RoomEquipment } from '../../services/equipmentService';

const AdminRoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('available');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Equipment state
  const [allEquipments, setAllEquipments] = useState<Equipment[]>([]);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedRoomForEquip, setSelectedRoomForEquip] = useState<Room | null>(null);
  const [roomEquipments, setRoomEquipments] = useState<RoomEquipment[]>([]);
  const [selectedEquipIds, setSelectedEquipIds] = useState<Record<string, number>>({});
  const [newEquipName, setNewEquipName] = useState('');

  useEffect(() => {
    loadRooms();
    loadAllEquipments();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await roomService.getAllRooms();
      if (response.success && response.data) setRooms(response.data);
    } catch (error) {
      console.error('โหลดข้อมูลไม่สำเร็จ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllEquipments = async () => {
    try {
      const response = await equipmentService.getAllEquipments();
      if (response.success && response.data) setAllEquipments(response.data);
    } catch (error) {
      console.error('โหลดอุปกรณ์ไม่สำเร็จ:', error);
    }
  };

  // ===== Room Form =====
  const openAddForm = () => {
    setEditingRoom(null);
    setName(''); setLocation(''); setCapacity(10); setDescription(''); setStatus('available'); setFormError('');
    setShowForm(true);
  };

  const openEditForm = (room: Room) => {
    setEditingRoom(room);
    setName(room.name); setLocation(room.location); setCapacity(room.capacity);
    setDescription(room.description || ''); setStatus(room.status); setFormError('');
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingRoom(null); setFormError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name || !location || !capacity) { setFormError('กรุณากรอกข้อมูลให้ครบ'); return; }
    setIsSubmitting(true);
    try {
      if (editingRoom) {
        await roomService.updateRoom(editingRoom.id, { name, location, capacity, description: description || undefined, status });
      } else {
        const input: CreateRoomInput = { name, location, capacity, description: description || undefined };
        await roomService.createRoom(input);
      }
      closeForm(); loadRooms();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('ต้องการลบห้องประชุมนี้หรือไม่?')) return;
    try { await roomService.deleteRoom(id); loadRooms(); } catch (err: any) { alert(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  // ===== Upload =====
  const handleUploadClick = (roomId: string) => { setUploadingId(roomId); fileInputRef.current?.click(); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) return;
    try { await roomService.uploadRoomImage(uploadingId, file); loadRooms(); } catch (err: any) { alert(err.response?.data?.message || 'อัพโหลดไม่สำเร็จ'); }
    finally { setUploadingId(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  // ===== Equipment Management =====
  const openEquipmentModal = async (room: Room) => {
    setSelectedRoomForEquip(room);
    setShowEquipmentModal(true);
    try {
      const response = await equipmentService.getRoomEquipments(room.id);
      if (response.success && response.data) {
        setRoomEquipments(response.data);
        // ตั้งค่า checkbox จากอุปกรณ์ที่มีอยู่แล้ว
        const selected: Record<string, number> = {};
        response.data.forEach((re) => { selected[re.equipmentId] = re.quantity; });
        setSelectedEquipIds(selected);
      }
    } catch (error) {
      console.error('โหลดอุปกรณ์ห้องไม่สำเร็จ:', error);
    }
  };

  const toggleEquipment = (equipId: string) => {
    setSelectedEquipIds((prev) => {
      const newSelected = { ...prev };
      if (newSelected[equipId]) {
        delete newSelected[equipId];
      } else {
        newSelected[equipId] = 1;
      }
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
      const equipments = Object.entries(selectedEquipIds).map(([equipmentId, quantity]) => ({
        equipmentId,
        quantity,
      }));
      await equipmentService.setRoomEquipments(selectedRoomForEquip.id, equipments);
      setShowEquipmentModal(false);
      setSelectedRoomForEquip(null);
      alert('บันทึกอุปกรณ์สำเร็จ');
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  // เพิ่มอุปกรณ์ใหม่ (master list)
  const addNewEquipment = async () => {
    if (!newEquipName.trim()) return;
    try {
      await equipmentService.createEquipment(newEquipName.trim());
      setNewEquipName('');
      loadAllEquipments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  // ลบอุปกรณ์ (master list)
  const deleteEquipmentMaster = async (id: string) => {
    if (!window.confirm('ต้องการลบอุปกรณ์นี้ออกจากระบบหรือไม่?')) return;
    try {
      await equipmentService.deleteEquipment(id);
      loadAllEquipments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { style: string; label: string }> = {
      available: { style: 'bg-green-100 text-green-700', label: 'ว่าง' },
      unavailable: { style: 'bg-red-100 text-red-700', label: 'ไม่ว่าง' },
      maintenance: { style: 'bg-yellow-100 text-yellow-700', label: 'ปิดปรับปรุง' },
    };
    const c = config[status] || { style: 'bg-gray-100 text-gray-500', label: status };
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${c.style}`}>{c.label}</span>;
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    return `http://localhost:5000${imagePath}`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">กำลังโหลดข้อมูล...</div></div>;
  }

  return (
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการห้องประชุม</h1>
          <p className="text-gray-500 mt-1">ทั้งหมด {rooms.length} ห้อง</p>
        </div>
        <button onClick={openAddForm} className="px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
          + เพิ่มห้องประชุม
        </button>
      </div>

      {/* ===== Room Form Modal ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingRoom ? 'แก้ไขห้องประชุม' : 'เพิ่มห้องประชุมใหม่'}
            </h2>
            {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อห้อง *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น ห้องประชุม A" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่งที่ตั้ง *</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="เช่น ชั้น 3 อาคาร B" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ความจุ (คน) *</label>
                <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} min={1} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="อุปกรณ์ในห้อง, หมายเหตุ" rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
              </div>
              {editingRoom && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option value="available">ว่าง</option>
                    <option value="unavailable">ไม่ว่าง</option>
                    <option value="maintenance">ปิดปรับปรุง</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
                  {isSubmitting ? 'กำลังบันทึก...' : editingRoom ? 'บันทึกการแก้ไข' : 'เพิ่มห้องประชุม'}
                </button>
                <button type="button" onClick={closeForm} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Equipment Modal ===== */}
      {showEquipmentModal && selectedRoomForEquip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              🔧 จัดการอุปกรณ์ - {selectedRoomForEquip.name}
            </h2>
            <p className="text-sm text-gray-500 mb-4">เลือกอุปกรณ์ที่มีในห้องนี้</p>

            {/* เพิ่มอุปกรณ์ใหม่เข้าระบบ */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs font-medium text-gray-600 mb-2">เพิ่มอุปกรณ์ใหม่เข้าระบบ</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEquipName}
                  onChange={(e) => setNewEquipName(e.target.value)}
                  placeholder="ชื่ออุปกรณ์ เช่น Microphone"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && addNewEquipment()}
                />
                <button
                  onClick={addNewEquipment}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                >
                  เพิ่ม
                </button>
              </div>
            </div>

            {/* รายการอุปกรณ์ทั้งหมด */}
            <div className="space-y-2 mb-4">
              {allEquipments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีอุปกรณ์ในระบบ</p>
              ) : (
                allEquipments.map((equip) => (
                  <div key={equip.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={!!selectedEquipIds[equip.id]}
                      onChange={() => toggleEquipment(equip.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="flex-1 text-sm text-gray-700">{equip.name}</span>

                    {/* จำนวน (แสดงเมื่อ checked) */}
                    {selectedEquipIds[equip.id] && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(equip.id, (selectedEquipIds[equip.id] || 1) - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                        >-</button>
                        <span className="w-8 text-center text-sm">{selectedEquipIds[equip.id]}</span>
                        <button
                          onClick={() => updateQuantity(equip.id, (selectedEquipIds[equip.id] || 1) + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                        >+</button>
                      </div>
                    )}

                    {/* ปุ่มลบอุปกรณ์จากระบบ */}
                    <button
                      onClick={() => deleteEquipmentMaster(equip.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      title="ลบออกจากระบบ"
                    >✕</button>
                  </div>
                ))
              )}
            </div>

            {/* ปุ่ม */}
            <div className="flex gap-3">
              <button
                onClick={saveRoomEquipments}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                บันทึกอุปกรณ์
              </button>
              <button
                onClick={() => { setShowEquipmentModal(false); setSelectedRoomForEquip(null); }}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Room Cards ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* รูปห้อง */}
            <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 relative group">
              {room.image ? (
                <img src={getImageUrl(room.image)!} alt={room.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><span className="text-4xl">🏢</span></div>
              )}
              <button
                onClick={() => handleUploadClick(room.id)}
                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <span className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                  📷 {room.image ? 'เปลี่ยนรูป' : 'อัพโหลดรูป'}
                </span>
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{room.name}</h3>
                {getStatusBadge(room.status)}
              </div>
              <div className="space-y-1 text-sm text-gray-500 mb-4">
                <p>📍 {room.location}</p>
                <p>👥 รองรับ {room.capacity} คน</p>
                {room.manager && <p>👤 ผู้ดูแล: {room.manager.firstName} {room.manager.lastName}</p>}
                {room.description && <p className="text-gray-400 truncate">📝 {room.description}</p>}
              </div>

              {/* ปุ่มจัดการ 3 ปุ่ม */}
              <div className="flex gap-2">
                <button onClick={() => openEditForm(room)} className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                  แก้ไข
                </button>
                <button onClick={() => openEquipmentModal(room)} className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">
                  🔧 อุปกรณ์
                </button>
                <button onClick={() => handleDelete(room.id)} className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition">
                  ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRoomsPage;