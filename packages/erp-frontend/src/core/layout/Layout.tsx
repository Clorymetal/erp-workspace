import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 transition-colors duration-300 print:block print:bg-white print:text-black">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <main className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
        <div className="print:hidden">
          <Header />
        </div>
        <div className="flex-1 overflow-y-auto w-full p-6 bg-gray-50/50 dark:bg-dark-bg/80 relative print:overflow-visible print:p-0 print:bg-transparent">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
