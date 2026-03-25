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
  //ทุกๆ 30 นาที
  // for (let h = 9; h <= 18; h++) {
  //   for (let m = 0; m < 60; m += 60) {
  //     if (h === 18 && m > 0) break;
  //     timeOptions.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  //   }
  // }

  //ทุกๆ 3 ชม.
  for (let h = 9; h <= 18; h += 3) {
    timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
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

  // Filter เวลาที่ผ่านไปแล้ว (ถ้าเลือกวันนี้)
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-teal-600 font-medium mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            จองห้องประชุม
          </div>
          <h1 className="text-2xl font-bold text-slate-800">สร้างการจองใหม่</h1>
          <p className="text-slate-400 text-sm mt-1">เลือกห้อง วันที่ และเวลาที่ต้องการ</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {/* Success */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          {/* เลือกห้อง */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              ห้องประชุม <span className="text-red-400">*</span>
            </label>
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
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all appearance-none text-sm"
              >
                <option value="">-- เลือกห้องประชุม --</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} - {room.location} (รองรับ {room.capacity} คน)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ข้อมูลห้อง */}
          {selectedRoom && (
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-teal-800 text-sm">{selectedRoom.name}</h3>
                  <div className="text-xs text-teal-600 space-y-0.5 mt-1">
                    <p>ตำแหน่ง: {selectedRoom.location}</p>
                    <p>ความจุ: {selectedRoom.capacity} คน</p>
                    {selectedRoom.description && <p>รายละเอียด: {selectedRoom.description}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* อุปกรณ์ */}
          {roomEquipments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.58-3.32a.5.5 0 010-.86l5.58-3.32a.5.5 0 01.75.43v6.64a.5.5 0 01-.75.43zM20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                อุปกรณ์ที่ต้องการใช้
              </label>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-slate-100">
                {roomEquipments.map((re) => (
                  <label key={re.equipmentId} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!selectedEquipments[re.equipmentId]}
                      onChange={() => toggleEquipment(re.equipmentId)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-teal-700 transition">{re.equipment.name}</span>
                    <span className="text-xs text-slate-400">(มี {re.quantity} ชิ้น)</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {roomId && roomEquipments.length === 0 && (
            <div className="text-sm text-slate-400 bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              ห้องนี้ยังไม่มีอุปกรณ์ที่ลงทะเบียน
            </div>
          )}

          {/* หัวข้อ */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              หัวข้อการประชุม <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ประชุมทีม IT ประจำสัปดาห์"
                required
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">รายละเอียดเพิ่มเติม</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดการประชุม (ไม่บังคับ)"
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none text-sm"
            />
          </div>

          {/* วันที่ */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              วันที่ <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
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
                className="w-full py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-medium hover:bg-amber-100 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
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
                    ตรวจสอบช่วงเวลาว่าง
                  </>
                )}
              </button>

              {showTimeSlots && (
                <div className="mt-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {selectedRoom?.name} — {new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </h4>
                    <button type="button" onClick={() => setShowTimeSlots(false)} className="text-slate-400 hover:text-slate-600 transition">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Legend */}
                  <div className="flex gap-4 mb-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-100 rounded border border-emerald-200" /> ว่าง</span>
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
                          <div key={t} className="px-3 py-2.5 text-xs bg-slate-100 text-slate-400 rounded-lg text-center border border-slate-200">
                            {t} - {nextTime} · ผ่านแล้ว
                          </div>
                        );
                      }
                      if (conflict) {
                        return (
                          <div key={t} className="px-3 py-2.5 text-xs bg-red-50 text-red-500 rounded-lg text-center border border-red-100">
                            {t} - {nextTime} · {conflict.user?.firstName || 'จองแล้ว'}
                          </div>
                        );
                      }
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => selectSlot(t, nextTime)}
                          className="px-3 py-2.5 text-xs bg-emerald-50 text-emerald-700 rounded-lg text-center hover:bg-emerald-100 transition cursor-pointer border border-emerald-200 font-medium"
                        >
                          {t} - {nextTime} · ว่าง
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* เวลา */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                เวลาเริ่ม <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all appearance-none text-sm"
                >
                  {getAvailableTimeOptions().map((t) => (
                    <option key={t} value={t}>{t} น.</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                เวลาสิ้นสุด <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all appearance-none text-sm"
                >
                  {timeOptions.filter((t) => t > startTime).map((t) => (
                    <option key={t} value={t}>{t} น.</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ปุ่ม */}
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 text-sm"
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
                'ยืนยันการจอง'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium"
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