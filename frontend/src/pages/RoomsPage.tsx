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

  const sortedRooms = [...rooms].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'available' ? -1 : 1;
    return a.capacity - b.capacity;
  });

  const filteredRooms = sortedRooms.filter((room) => {
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

  const availableCount = sortedRooms.filter((r) => r.status === 'available').length;

  const filterChips = [
    { value: 'name', label: 'ชื่อห้อง', placeholder: 'พิมพ์ชื่อห้อง...' },
    { value: 'capacity', label: 'ความจุ', placeholder: 'จำนวนคนขั้นต่ำ เช่น 20' },
    { value: 'equipment', label: 'อุปกรณ์', placeholder: 'เช่น โปรเจคเตอร์' },
    { value: 'location', label: 'สถานที่', placeholder: 'เช่น อาคาร 2, ชั้น 3' },
  ];

  const activeChip = filterChips.find((c) => c.value === searchBy)!;

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    return imagePath;
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
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-teal-600 font-medium mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            ห้องประชุม
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ห้องประชุมทั้งหมด</h1>
          <p className="text-slate-400 text-sm mt-1">
            {rooms.length} ห้อง ·
            <span className="text-emerald-600 font-medium"> ว่าง {availableCount} ห้อง</span>
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

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {filterChips.map((chip) => (
            <button
              key={chip.value}
              onClick={() => { setSearchBy(chip.value as any); setSearchTerm(''); }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-xl font-medium transition-all ${
                searchBy === chip.value
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
            >
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
          <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-slate-600 text-sm font-medium">
            {searchTerm ? 'ไม่พบห้องประชุมที่ค้นหา' : 'ยังไม่มีห้องประชุมในระบบ'}
          </p>
        </div>
      ) : (
        <StaggerContainer key={`${searchBy}-${searchTerm}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const isAvailable = room.status === 'available';
            const imageUrl = getImageUrl(room.image ?? null);
            return (
              <StaggerItem key={room.id}>
                <div
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => isAvailable && navigate(`/bookings/new?roomId=${room.id}`)}
                >
                  {/* Image Area */}
                  <div className="h-44 relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center relative ${isAvailable ? 'bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full" />
                        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full" />
                        <svg className="w-14 h-14 text-white/30 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500 text-white shadow-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          ว่าง
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-700/80 text-white backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          ไม่ว่าง
                        </span>
                      )}
                    </div>

                    {/* Capacity badge bottom left */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-black/40 text-white backdrop-blur-sm">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        {room.capacity} คน
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 text-base mb-1.5 group-hover:text-teal-700 transition">
                      {room.name}
                    </h3>

                    <div className="space-y-1.5 text-sm text-slate-500 mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span>{room.location}</span>
                      </div>
                      {room.manager && (
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{room.manager.firstName} {room.manager.lastName}</span>
                        </div>
                      )}
                      {room.description && (
                        <p className="text-xs text-slate-400 line-clamp-1">{room.description}</p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAvailable) navigate(`/bookings/new?roomId=${room.id}`);
                      }}
                      disabled={!isAvailable}
                      className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all ${
                        isAvailable
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-md shadow-teal-500/25 hover:shadow-lg hover:shadow-teal-500/30 active:scale-95'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isAvailable ? 'จองห้องนี้' : 'ไม่สามารถจองได้'}
                    </button>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
    </PageTransition>
  );
};

export default RoomsPage;
