import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Room } from '../types/room';
import * as roomService from '../services/roomService';

const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // โหลดข้อมูลห้องตอนเปิดหน้า
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await roomService.getAllRooms();
      if (response.success && response.data) {
        setRooms(response.data);
      }
    } catch (error) {
      console.error('โหลดข้อมูลห้องไม่สำเร็จ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // กรองห้องตาม search
  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // แสดงสถานะห้องเป็นภาษาไทย
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">ว่าง</span>;
      case 'unavailable':
        return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">ไม่ว่าง</span>;
      case 'maintenance':
        return <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">ปิดปรับปรุง</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">{status}</span>;
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ห้องประชุม</h1>
          <p className="text-gray-500 mt-1">ห้องประชุมทั้งหมด {rooms.length} ห้อง</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="ค้นหาห้องประชุม (ชื่อห้อง, ตำแหน่ง)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Room Cards */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? 'ไม่พบห้องประชุมที่ค้นหา' : 'ยังไม่มีห้องประชุมในระบบ'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/bookings/new?roomId=${room.id}`)}
            >
              {/* Room Image */}
              <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                {room.image ? (
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🏢</span>
                )}
              </div>

              {/* Room Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{room.name}</h3>
                  {getStatusBadge(room.status)}
                </div>

                <div className="space-y-1.5 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{room.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>รองรับ {room.capacity} คน</span>
                  </div>
                  {room.manager && (
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>ผู้ดูแล: {room.manager.firstName} {room.manager.lastName}</span>
                    </div>
                  )}
                </div>

                {room.description && (
                  <p className="text-sm text-gray-400 mt-3 line-clamp-2">{room.description}</p>
                )}

                {/* ปุ่มจอง */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/bookings/new?roomId=${room.id}`);
                  }}
                  disabled={room.status !== 'available'}
                  className="w-full mt-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {room.status === 'available' ? 'จองห้องนี้' : 'ไม่สามารถจองได้'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;