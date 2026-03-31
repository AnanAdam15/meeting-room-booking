import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar ด้านซ้าย — ซ่อนตอน print */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* เนื้อหาด้านขวา */}
      <div className="flex-1 flex flex-col">
        {/* Navbar — ซ่อนตอน print, ติดด้านบนตอน scroll */}
        <div className="print:hidden sticky top-0 z-40">
          <Navbar />
        </div>
        <main className="flex-1 p-6 print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;