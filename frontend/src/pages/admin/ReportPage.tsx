import { useState, useEffect } from 'react';
import * as reportService from '../../services/reportService';
import type { RoomUsageReport } from '../../services/reportService';

const ReportPage = () => {
  const [report, setReport] = useState<RoomUsageReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // ตั้งค่าเริ่มต้นเป็นเดือนปัจจุบัน
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
      if (response.success && response.data) {
        setReport(response.data);
      }
    } catch (error) {
      console.error('โหลดรายงานไม่สำเร็จ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadReport(startDate, endDate);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  // หาห้องที่ใช้มากสุด
  const mostUsedRoom = report?.roomStats?.[0];

  // คำนวณ % bar
  const maxBookings = report?.roomStats?.length
    ? Math.max(...report.roomStats.map((r) => r.totalBookings))
    : 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">กำลังโหลดรายงาน...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">รายงานสรุปการใช้งาน</h1>
        <p className="text-gray-500 mt-1">สรุปจำนวนการใช้งานห้องประชุมตามช่วงเวลา</p>
      </div>

      {/* ตัวเลือกช่วงเวลา */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ค้นหา
          </button>
        </div>
      </div>

      {report && (
        <>
          {/* สรุปภาพรวม */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">{report.totalRooms}</p>
              <p className="text-sm text-gray-500 mt-1">ห้องประชุมทั้งหมด</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-green-600">{report.totalBookings}</p>
              <p className="text-sm text-gray-500 mt-1">การจองทั้งหมด</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-purple-600">{report.totalHours}</p>
              <p className="text-sm text-gray-500 mt-1">ชั่วโมงรวม</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-yellow-600">{mostUsedRoom?.roomName || '-'}</p>
              <p className="text-sm text-gray-500 mt-1">ห้องยอดนิยม</p>
            </div>
          </div>

          {/* กราฟแท่ง (CSS) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">📊 จำนวนการจองแต่ละห้อง</h2>
            <div className="space-y-3">
              {report.roomStats.map((room) => (
                <div key={room.roomId} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-gray-700 truncate shrink-0">{room.roomName}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative">
                    <div
                      className="bg-blue-500 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                      style={{ width: `${maxBookings > 0 ? (room.totalBookings / maxBookings) * 100 : 0}%`, minWidth: room.totalBookings > 0 ? '40px' : '0' }}
                    >
                      {room.totalBookings > 0 && (
                        <span className="text-white text-xs font-medium">{room.totalBookings}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 w-20 text-right shrink-0">{room.totalHours} ชม.</div>
                </div>
              ))}
            </div>
          </div>

          {/* ตารางรายละเอียด */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">ห้องประชุม</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">ตำแหน่ง</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">ความจุ</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">จองทั้งหมด</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">อนุมัติแล้ว</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">รออนุมัติ</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">ชั่วโมงรวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.roomStats.map((room) => (
                    <tr key={room.roomId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{room.roomName}</td>
                      <td className="px-4 py-3 text-gray-600">{room.location}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{room.capacity} คน</td>
                      <td className="px-4 py-3 text-center font-medium text-blue-600">{room.totalBookings}</td>
                      <td className="px-4 py-3 text-center text-green-600">{room.approvedBookings}</td>
                      <td className="px-4 py-3 text-center text-yellow-600">{room.pendingBookings}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{room.totalHours} ชม.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ช่วงเวลา */}
          <p className="text-xs text-gray-400 text-center mt-4">
            ข้อมูลช่วง {formatDate(report.period.start)} - {formatDate(report.period.end)}
          </p>
        </>
      )}
    </div>
  );
};

export default ReportPage;