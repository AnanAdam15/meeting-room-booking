import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Room } from '../types/room';
import * as roomService from '../services/roomService';
import * as bookingService from '../services/bookingService';
import * as equipmentService from '../services/equipmentService';
import type { RoomEquipment } from '../services/equipmentService';

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedRoomId = searchParams.get('roomId');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [roomId, setRoomId] = useState(preSelectedRoomId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Equipment State
  const [roomEquipments, setRoomEquipments] = useState<RoomEquipment[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await roomService.getAllRooms();
        if (response.success && response.data) {
          setRooms(response.data.filter((r) => r.status === 'available'));
        }
      } catch (error) {
        console.error('โหลดข้อมูลห้องไม่สำเร็จ:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRooms();
  }, []);

  // เมื่อเลือกห้อง → โหลดอุปกรณ์ของห้องนั้น
  useEffect(() => {
    if (roomId) {
      loadRoomEquipments(roomId);
    } else {
      setRoomEquipments([]);
      setSelectedEquipments({});
    }
  }, [roomId]);

  const loadRoomEquipments = async (id: string) => {
    try {
      const response = await equipmentService.getRoomEquipments(id);
      if (response.success && response.data) {
        setRoomEquipments(response.data);
      }
    } catch (error) {
      console.error('โหลดอุปกรณ์ไม่สำเร็จ:', error);
    }
  };

  // Toggle checkbox
  const toggleEquipment = (equipmentId: string) => {
    setSelectedEquipments((prev) => {
      const newSelected = { ...prev };
      if (newSelected[equipmentId]) {
        delete newSelected[equipmentId];
      } else {
        newSelected[equipmentId] = 1;
      }
      return newSelected;
    });
  };

  const selectedRoom = rooms.find((r) => r.id === roomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!roomId || !title || !date || !startTime || !endTime) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    const startDatetime = `${date}T${startTime}:00`;
    const endDatetime = `${date}T${endTime}:00`;

    if (endTime <= startTime) {
      setError('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
      return;
    }

    setIsSubmitting(true);

    try {
      // สร้าง array อุปกรณ์ที่เลือก
      const equipmentsList = Object.entries(selectedEquipments).map(([equipmentId, quantity]) => ({
        equipmentId,
        quantity,
      }));

      const response = await bookingService.createBooking({
        title,
        description: description || undefined,
        startDatetime,
        endDatetime,
        roomId,
        equipments: equipmentsList.length > 0 ? equipmentsList : undefined,
      });

      if (response.success) {
        setSuccess('จองห้องประชุมสำเร็จ! รอการอนุมัติ');
        setTimeout(() => navigate('/my-bookings'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">จองห้องประชุม</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* เลือกห้อง */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ห้องประชุม <span className="text-red-500">*</span></label>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option value="">-- เลือกห้องประชุม --</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} - {room.location} (รองรับ {room.capacity} คน)
              </option>
            ))}
          </select>
        </div>

        {/* แสดงข้อมูลห้อง */}
        {selectedRoom && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">📍 {selectedRoom.name}</h3>
            <div className="text-sm text-blue-600 space-y-1">
              <p>ตำแหน่ง: {selectedRoom.location}</p>
              <p>ความจุ: {selectedRoom.capacity} คน</p>
              {selectedRoom.description && <p>รายละเอียด: {selectedRoom.description}</p>}
            </div>
          </div>
        )}

        {/* เลือกอุปกรณ์ (checkbox) */}
        {roomEquipments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔧 อุปกรณ์ที่ต้องการใช้ (เลือกได้หลายรายการ)
            </label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {roomEquipments.map((re) => (
                <label
                  key={re.equipmentId}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!!selectedEquipments[re.equipmentId]}
                    onChange={() => toggleEquipment(re.equipmentId)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {re.equipment.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    (มี {re.quantity} ชิ้น)
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {roomId && roomEquipments.length === 0 && (
          <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
            ℹ️ ห้องนี้ยังไม่มีอุปกรณ์ที่ลงทะเบียน
          </div>
        )}

        {/* หัวข้อ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อการประชุม <span className="text-red-500">*</span></label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น ประชุมทีม IT ประจำสัปดาห์" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>

        {/* รายละเอียด */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="รายละเอียดการประชุม (ไม่บังคับ)" rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
        </div>

        {/* วันที่ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ <span className="text-red-500">*</span></label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>

        {/* เวลา */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเริ่ม <span className="text-red-500">*</span></label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เวลาสิ้นสุด <span className="text-red-500">*</span></label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
        </div>

        {/* ปุ่ม */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'กำลังจอง...' : 'ยืนยันการจอง'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBookingPage;