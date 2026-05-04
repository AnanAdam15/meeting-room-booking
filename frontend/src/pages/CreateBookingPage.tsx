import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Room } from '../types/room';
import * as roomService from '../services/roomService';
import * as bookingService from '../services/bookingService';
import * as equipmentService from '../services/equipmentService';
import type { RoomEquipment } from '../services/equipmentService';
import { PageTransition } from '../components/animations';

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
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const timeOptions: string[] = [];
  for (let h = 9; h <= 18; h++) {
    for (let m = 0; m < 60; m += 60) {
      if (h === 18 && m > 0) break;
      timeOptions.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  // Equipment State
  const [roomEquipments, setRoomEquipments] = useState<RoomEquipment[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<Record<string, number>>({});
  const [roomBookings, setRoomBookings] = useState<any[]>([]);
  const [isCheckingSlots, setIsCheckingSlots] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

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

  useEffect(() => {
    if (roomId) {
      loadRoomEquipments(roomId);
    } else {
      setRoomEquipments([]);
      setSelectedEquipments({});
    }
  }, [roomId]);

  // โหลดอุปกรณ์ที่มีในห้องที่เลือก (แสดง checkbox ให้ user เลือก)
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

  // toggle เลือก/ยกเลิกอุปกรณ์ที่ต้องการใช้
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

  // ข้อมูลห้องที่ถูกเลือก (ใช้แสดงรายละเอียดห้อง)
  const selectedRoom = rooms.find((r) => r.id === roomId);

  // checkTimeSlots → bookingService.getRoomBookingsByDate(roomId, date)
  //   → GET /api/bookings/room/:roomId?date=YYYY-MM-DD [backend: booking.controller.ts]
  //     → prisma.booking.findMany({ where: { roomId, date, status: approved } })
  // ← setRoomBookings() + setShowTimeSlots(true) → แสดง time grid
  const checkTimeSlots = async () => {
    if (!roomId || !date) {
      setError('กรุณาเลือกห้องและวันที่ก่อน');
      return;
    }
    setIsCheckingSlots(true);
    try {
      const response = await bookingService.getRoomBookingsByDate(roomId, date);
      if (response.success) {
        setRoomBookings(response.data || []);
        setShowTimeSlots(true);
      }
    } catch (err) {
      console.error('โหลดข้อมูลไม่สำเร็จ:', err);
    } finally {
      setIsCheckingSlots(false);
    }
  };

  // getSlotStatus(slotStart, slotEnd) → ตรวจ overlap กับ roomBookings[]
  //   ← return booking ที่ชน หรือ undefined (ถ้าว่าง)
  //   ใช้ใน time grid เพื่อแสดงสีแดง/เขียว
  const getSlotStatus = (slotStart: string, slotEnd: string) => {
    const slotS = new Date(`${date}T${slotStart}:00`);
    const slotE = new Date(`${date}T${slotEnd}:00`);
    return roomBookings.find((b: any) => {
      const bStart = new Date(b.startDatetime);
      const bEnd = new Date(b.endDatetime);
      return slotS < bEnd && slotE > bStart;
    });
  };

  const selectSlot = (slotStart: string, slotEnd: string) => {
    setStartTime(slotStart);
    setEndTime(slotEnd);
    setShowTimeSlots(false);
  };

  const getAvailableTimeOptions = () => {
    return timeOptions.filter((t) => {
      if (!date) return true;
      const today = new Date().toISOString().split('T')[0];
      if (date !== today) return true;
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      return t > currentTime;
    });
  };

  // handleSubmit → validate (เวลา 09-18, ไม่ย้อนหลัง, endTime > startTime)
  //   → bookingService.createBooking(data) [services/bookingService.ts]
  //     → POST /api/bookings [backend: booking.controller.ts]
  //       → ตรวจ time overlap กับ booking อื่นในห้องเดียวกัน
  //       → prisma.booking.create({ status: 'pending' })
  //       → prisma.bookingEquipment.createMany(equipments)
  //       → createNotification(adminId, 'new_booking_pending')
  //       → sendEmail(admin, 'มีคำขอจองใหม่') [Nodemailer]
  // ← navigate('/my-bookings') หลัง 2 วินาที
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

    if (startTime < '09:00' || startTime > '18:00' || endTime < '09:00' || endTime > '18:00') {
      setError('เวลาจองต้องอยู่ในช่วง 09:00 - 18:00 เท่านั้น');
      return;
    }

    if (endTime <= startTime) {
      setError('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
      return;
    }

    const now = new Date();
    const bookingStart = new Date(`${date}T${startTime}:00`);
    if (bookingStart < now) {
      setError('ไม่สามารถจองเวลาที่ผ่านมาแล้วได้ กรุณาเลือกเวลาใหม่');
      return;
    }

    setIsSubmitting(true);

    try {
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
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-slate-800 rounded-2xl p-6 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-teal-200/80 text-sm font-medium mb-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                สร้างการจองใหม่
              </div>
              <h1 className="text-2xl font-bold text-white">จองห้องประชุม</h1>
              <p className="text-teal-200/70 text-sm mt-1">เลือกห้อง วันที่ และเวลาที่ต้องการ</p>
            </div>
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-2.5">
            <div className="w-7 h-7 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Section 1: เลือกห้อง */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">เลือกห้องประชุม</h2>
                <p className="text-xs text-slate-400">ห้องที่พร้อมใช้งาน {rooms.length} ห้อง</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all appearance-none text-sm"
              >
                <option value="">-- เลือกห้องประชุม --</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} - {room.location} (รองรับ {room.capacity} คน)
                  </option>
                ))}
              </select>
            </div>

            {/* Room Preview Card */}
            {selectedRoom && (
              <div className="mt-3 bg-gradient-to-br from-teal-50 to-teal-50/30 rounded-xl p-4 border border-teal-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-teal-500/25">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm">{selectedRoom.name}</h3>
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <svg className="w-3 h-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {selectedRoom.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <svg className="w-3 h-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        {selectedRoom.capacity} คน
                      </span>
                    </div>
                    {selectedRoom.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{selectedRoom.description}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    ว่าง
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: หัวข้อและรายละเอียด */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">รายละเอียดการประชุม</h2>
                <p className="text-xs text-slate-400">หัวข้อและรายละเอียดเพิ่มเติม</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  หัวข้อการประชุม <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น ประชุมทีม IT ประจำสัปดาห์"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">รายละเอียดเพิ่มเติม</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="รายละเอียดการประชุม วาระ หรือข้อมูลเพิ่มเติม (ไม่บังคับ)"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: อุปกรณ์ */}
          {roomId && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.58-3.32a.5.5 0 010-.86l5.58-3.32a.5.5 0 01.75.43v6.64a.5.5 0 01-.75.43zM20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">อุปกรณ์ที่ต้องการ</h2>
                  <p className="text-xs text-slate-400">เลือกอุปกรณ์ที่ต้องการใช้ในการประชุม</p>
                </div>
              </div>

              {roomEquipments.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {roomEquipments.map((re) => {
                    const isSelected = !!selectedEquipments[re.equipmentId];
                    return (
                      <button
                        key={re.equipmentId}
                        type="button"
                        onClick={() => toggleEquipment(re.equipmentId)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected ? 'bg-amber-500 border-amber-500' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{re.equipment.name}</p>
                          <p className="text-xs opacity-60">มี {re.quantity} ชิ้น</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  ห้องนี้ยังไม่มีอุปกรณ์ที่ลงทะเบียน
                </div>
              )}
            </div>
          )}

          {/* Section 4: วันและเวลา */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">วันและเวลา</h2>
                <p className="text-xs text-slate-400">ช่วงเวลาที่ต้องการจอง (09:00 - 18:00)</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* วันที่ */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  วันที่ <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* ตรวจสอบช่วงเวลา */}
              {roomId && date && (
                <div>
                  <button
                    type="button"
                    onClick={checkTimeSlots}
                    disabled={isCheckingSlots}
                    className="w-full py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-medium hover:bg-blue-100 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {isCheckingSlots ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        กำลังตรวจสอบ...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        ดูช่วงเวลาว่างของห้อง
                      </>
                    )}
                  </button>

                  {showTimeSlots && (
                    <div className="mt-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-slate-700">
                          {selectedRoom?.name} — {new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </h4>
                        <button type="button" onClick={() => setShowTimeSlots(false)} className="text-slate-400 hover:text-slate-600 transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex gap-3 mb-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-100 rounded border border-emerald-200" /> ว่าง (คลิกเพื่อเลือก)</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-100 rounded border border-red-200" /> ไม่ว่าง</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-100 rounded border border-slate-200" /> ผ่านแล้ว</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {timeOptions.slice(0, -1).map((t, i) => {
                          const nextTime = timeOptions[i + 1];
                          if (!nextTime) return null;
                          const conflict = getSlotStatus(t, nextTime);
                          const isPast = new Date(`${date}T${t}:00`) < new Date();

                          if (isPast) {
                            return (
                              <div key={t} className="px-3 py-2.5 text-xs bg-slate-100 text-slate-400 rounded-xl text-center border border-slate-200">
                                {t} - {nextTime}
                                <br /><span className="opacity-60">ผ่านแล้ว</span>
                              </div>
                            );
                          }
                          if (conflict) {
                            return (
                              <div key={t} className="px-3 py-2.5 text-xs bg-red-50 text-red-500 rounded-xl text-center border border-red-100">
                                {t} - {nextTime}
                                <br /><span className="opacity-80">{conflict.user?.firstName || 'จองแล้ว'}</span>
                              </div>
                            );
                          }
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => selectSlot(t, nextTime)}
                              className="px-3 py-2.5 text-xs bg-emerald-50 text-emerald-700 rounded-xl text-center hover:bg-emerald-100 hover:shadow-sm transition cursor-pointer border border-emerald-200 font-medium"
                            >
                              {t} - {nextTime}
                              <br /><span className="opacity-70">ว่าง</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* เวลา */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    เวลาเริ่ม <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      value={startTime}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setStartTime(newStart);
                        if (endTime <= newStart) {
                          const nextTime = timeOptions.find((t) => t > newStart);
                          if (nextTime) setEndTime(nextTime);
                        }
                      }}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all appearance-none text-sm"
                    >
                      {getAvailableTimeOptions().filter((t) => t < '18:00').map((t) => (
                        <option key={t} value={t}>{t} น.</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    เวลาสิ้นสุด <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all appearance-none text-sm"
                    >
                      {timeOptions.filter((t) => t > startTime).map((t) => (
                        <option key={t} value={t}>{t} น.</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Time Summary */}
              {date && startTime && endTime && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-2.5 border border-blue-100">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <span className="text-xs text-blue-700">
                    {new Date(date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} เวลา {startTime} - {endTime} น.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3.5 rounded-2xl font-semibold hover:from-teal-600 hover:to-teal-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25 text-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  กำลังจอง...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ยืนยันการจอง
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3.5 border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition text-sm font-medium"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default CreateBookingPage;
