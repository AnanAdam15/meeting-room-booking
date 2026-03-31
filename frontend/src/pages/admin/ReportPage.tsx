import { useState, useEffect } from 'react';
import * as reportService from '../../services/reportService';
import type { RoomUsageReport } from '../../services/reportService';
import { PageTransition, StaggerContainer, StaggerItem } from '../../components/animations';

const ReportPage = () => {
  const [report, setReport] = useState<RoomUsageReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
    loadReport(firstDay, lastDay);
  }, []);

  const loadReport = async (start?: string, end?: string) => {
    setIsLoading(true);
    try {
      const response = await reportService.getRoomUsageReport(start, end);
      if (response.success && response.data) setReport(response.data);
    } catch (error) {
      console.error('โหลดรายงานไม่สำเร็จ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => loadReport(startDate, endDate);

  const handlePrint = () => window.print();

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  const mostUsedRoom = report?.roomStats?.[0];
  const maxBookings = report?.roomStats?.length
    ? Math.max(...report.roomStats.map((r) => r.totalBookings))
    : 1;

  const barColors = [
    'bg-teal-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500',
    'bg-emerald-500', 'bg-rose-500', 'bg-indigo-500', 'bg-cyan-500',
  ];
  const barColorHex = [
    '#14b8a6', '#0ea5e9', '#8b5cf6', '#f59e0b',
    '#10b981', '#f43f5e', '#6366f1', '#06b6d4',
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          กำลังโหลดรายงาน...
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
    <div>

      {/* ===== Header — ซ่อนตอน print ===== */}
      <div className="print:hidden flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-teal-600 font-medium mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            รายงาน
          </div>
          <h1 className="text-2xl font-bold text-slate-800">สรุปการใช้งานห้องประชุม</h1>
          <p className="text-slate-400 text-sm mt-1">สรุปจำนวนการใช้งานตามช่วงเวลาที่เลือก</p>
        </div>
        {report && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            พิมพ์ / Export PDF
          </button>
        )}
      </div>

      {/* ===== Date Filter — ซ่อนตอน print ===== */}
      <div className="print:hidden bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">วันที่เริ่มต้น</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">วันที่สิ้นสุด</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm" />
            </div>
          </div>
          <button onClick={handleSearch}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            ค้นหา
          </button>
        </div>
      </div>

      {report && (
        <div>
          {/* ===== Print-only header — ซ่อนบนหน้าจอ แสดงตอน print ===== */}
          <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-300">
            <h1 className="text-xl font-bold text-slate-800">รายงานสรุปการใช้งานห้องประชุม</h1>
            <p className="text-sm text-slate-500 mt-1">
              ช่วงเวลา: {formatDate(report.period.start)} — {formatDate(report.period.end)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Summary Cards */}
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: 'ห้องประชุมทั้งหมด', value: report.totalRooms,
                color: 'bg-teal-50 text-teal-600 border-teal-100', iconBg: 'bg-teal-100',
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
              },
              {
                label: 'การจองทั้งหมด', value: report.totalBookings,
                color: 'bg-sky-50 text-sky-600 border-sky-100', iconBg: 'bg-sky-100',
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
              },
              {
                label: 'ชั่วโมงรวม', value: report.totalHours,
                color: 'bg-violet-50 text-violet-600 border-violet-100', iconBg: 'bg-violet-100',
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              },
              {
                label: 'ห้องยอดนิยม', value: mostUsedRoom?.roomName || '-',
                color: 'bg-amber-50 text-amber-600 border-amber-100', iconBg: 'bg-amber-100',
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
              },
            ].map((card) => (
              <StaggerItem key={card.label}>
                <div className={`rounded-xl border p-4 ${card.color}`}>
                  <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center mb-3`}>
                    {card.icon}
                  </div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs opacity-70 mt-0.5">{card.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <h2 className="font-semibold text-slate-800 text-sm">จำนวนการจองแต่ละห้อง</h2>
            </div>
            {report.roomStats.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">ไม่มีข้อมูลการจองในช่วงเวลานี้</p>
            ) : (
              <div className="space-y-3">
                {report.roomStats.map((room, index) => (
                  <div key={room.roomId} className="flex items-center gap-4">
                    <div className="w-28 text-sm text-slate-600 truncate shrink-0 font-medium">{room.roomName}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                      <div
                        className={`${barColors[index % barColors.length]} h-8 rounded-full flex items-center justify-end pr-3`}
                        style={{
                          width: `${maxBookings > 0 ? (room.totalBookings / maxBookings) * 100 : 0}%`,
                          minWidth: room.totalBookings > 0 ? '40px' : '0',
                          backgroundColor: barColorHex[index % barColorHex.length],
                          WebkitPrintColorAdjust: 'exact',
                          printColorAdjust: 'exact',
                        } as React.CSSProperties}
                      >
                        {room.totalBookings > 0 && (
                          <span className="text-white text-xs font-semibold">{room.totalBookings}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 w-16 text-right shrink-0">{room.totalHours} ชม.</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v.375" />
                </svg>
                รายละเอียดแต่ละห้อง
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">ห้องประชุม</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">ตำแหน่ง</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">ความจุ</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">จองทั้งหมด</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">อนุมัติแล้ว</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">รออนุมัติ</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">ชั่วโมง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.roomStats.map((room, index) => (
                  <tr key={room.roomId}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2 h-8 rounded-full shrink-0"
                          style={{ backgroundColor: barColorHex[index % barColorHex.length], WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties}
                        />
                        <span className="font-medium text-slate-700">{room.roomName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{room.location}</td>
                    <td className="px-4 py-3.5 text-center text-slate-500">{room.capacity} คน</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-teal-600">{room.totalBookings}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-emerald-600">{room.approvedBookings}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-amber-600">{room.pendingBookings}</td>
                    <td className="px-4 py-3.5 text-center text-slate-500 font-medium">{room.totalHours} ชม.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Period info */}
          <p className="text-xs text-slate-400 text-center mt-4">
            ข้อมูลช่วง {formatDate(report.period.start)} - {formatDate(report.period.end)}
          </p>
        </div>
      )}
    </div>
    </PageTransition>
  );
};

export default ReportPage;
