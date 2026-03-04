import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Room } from '../types/room';
import * as roomService from '../services/roomService';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/animations';

const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<'name' | 'capacity' | 'equipment' | 'location'>('name');
  const navigate = useNavigate();

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

  const filteredRooms = rooms.filter((room) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    switch (searchBy) {
      case 'name':
        return room.name.toLowerCase().includes(term);
      case 'location':
        return room.location.toLowerCase().includes(term);
      case 'capacity':
        const num = parseInt(searchTerm);
        return !isNaN(num) && room.capacity >= num;
      case 'equipment':
        return room.description?.toLowerCase().includes(term);
      default:
        return true;
    }
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string; dot: string }> = {
      available: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'ว่าง', dot: 'bg-emerald-500' },
      unavailable: { bg: 'bg-red-50', text: 'text-red-600', label: 'ไม่ว่าง', dot: 'bg-red-500' },
      maintenance: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'ปิดปรับปรุง', dot: 'bg-amber-500' },
    };
    const c = config[status] || { bg: 'bg-slate-50', text: 'text-slate-600', label: status, dot: 'bg-slate-400' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    );
  };

  const filterChips = [
    {
      value: 'name',
      label: 'ชื่อห้อง',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      placeholder: 'พิมพ์ชื่อห้อง...',
    },
    {
      value: 'capacity',
      label: 'ความจุ',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      placeholder: 'พิมพ์จำนวนคนขั้นต่ำ เช่น 20',
    },
    {
      value: 'equipment',
      label: 'อุปกรณ์',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.58-3.32a.5.5 0 010-.86l5.58-3.32a.5.5 0 01.75.43v6.64a.5.5 0 01-.75.43zM20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      placeholder: 'พิมพ์ชื่ออุปกรณ์ เช่น โปรเจคเตอร์',
    },
    {
      value: 'location',
      label: 'สถานที่',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
      placeholder: 'พิมพ์ตำแหน่ง เช่น อาคาร 2',
    },
  ];

  const activeChip = filterChips.find((c) => c.value === searchBy)!;

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-teal-600 font-medium mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            ห้องประชุม
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ห้องประชุมทั้งหมด</h1>
          <p className="text-slate-400 text-sm mt-1">
            {rooms.length} ห้อง · ว่าง {rooms.filter((r) => r.status === 'available').length} ห้อง
          </p>
        </div>
        <button
          onClick={() => navigate('/bookings/new')}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          จองห้องประชุม
        </button>
      </div>

      {/* Search + Filter Chips */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {filterChips.map((chip) => (
            <button
              key={chip.value}
              onClick={() => {
                setSearchBy(chip.value as any);
                setSearchTerm('');
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-lg font-medium transition-all ${
                searchBy === chip.value
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {chip.icon}
              {chip.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type={searchBy === 'capacity' ? 'number' : 'text'}
            placeholder={activeChip.placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Room Cards */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">
            {searchTerm ? 'ไม่พบห้องประชุมที่ค้นหา' : 'ยังไม่มีห้องประชุมในระบบ'}
          </p>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => (
            <StaggerItem key={room.id}>
            <div
              key={room.id}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
              onClick={() => navigate(`/bookings/new?roomId=${room.id}`)}
            >
              {/* Room Image */}
              <div className="h-40 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center relative overflow-hidden">
                {room.image ? (
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <>
                    {/* Decorative elements */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full" />
                    <svg className="w-12 h-12 text-white/40 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </>
                )}
                {/* Status badge overlay */}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(room.status)}
                </div>
              </div>

              {/* Room Info */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-800 text-base mb-2 group-hover:text-teal-700 transition">
                  {room.name}
                </h3>

                <div className="space-y-2 text-sm text-slate-500 mb-3">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span>{room.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    <span>รองรับ {room.capacity} คน</span>
                  </div>
                  {room.manager && (
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>ผู้ดูแล: {room.manager.firstName} {room.manager.lastName}</span>
                    </div>
                  )}
                </div>

                {room.description && (
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">{room.description}</p>
                )}

                {/* Book button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/bookings/new?roomId=${room.id}`);
                  }}
                  disabled={room.status !== 'available'}
                  className="w-full py-2.5 text-sm font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-600 hover:text-white hover:border-teal-600 hover:shadow-lg hover:shadow-teal-600/20"
                >
                  {room.status === 'available' ? 'จองห้องนี้' : 'ไม่สามารถจองได้'}
                </button>
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

export default RoomsPage;