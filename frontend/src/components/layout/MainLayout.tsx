import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar ด้านซ้าย */}
      <Sidebar />

      {/* เนื้อหาด้านขวา */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <Outlet />  {/* หน้าต่างๆ จะแสดงตรงนี้ */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;