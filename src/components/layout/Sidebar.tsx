'use client';

import {
  Menu,
  ChevronLeft,
  // Layers,
  // Triangle,
  Globe,
  LayoutDashboard,
  DatabaseZap,
  LocateFixed,
  FileText,
} from 'lucide-react';
import { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Sidebar Item Props Type
interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  isOpen: boolean;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isOpen, active }) => {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition cursor-pointer ${
        active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-800'
      } ${isOpen ? 'justify-start' : 'justify-center'}`}
      title={label}
    >
      <div className="min-w-[20px]">{icon}</div>
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const getCurrentTab = (): string => {
    if (pathname === '/') return 'Dashboard';
    if (pathname === '/federated_search') return 'Federated Search';
    if (pathname === '/map_search') return 'Map Search';
    if (pathname === '/contribute') return 'Contribute';
    if (pathname === '/datasets') return 'Datasets';
    return '';
  };

  const currentTab = getCurrentTab();

  return (
    <div
      className={`bg-white text-gray-800 border-r border-gray-200 shadow-md transition-all duration-300 ${
        isSidebarOpen ? 'w-52' : 'w-16'
      } h-screen flex flex-col`}
    >
      {/* Toggle Button */}
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-gray-100"
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
        {isSidebarOpen && <span className="text-xl font-medium px-4">CML</span>}
      </div>

      {/* Sidebar Items */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href="/">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            isOpen={isSidebarOpen}
            active={currentTab === 'Dashboard'}
          />
        </Link>

        <Link href="/federated_search">
          <SidebarItem
            icon={<Globe size={18} />}
            label="Federated Search"
            isOpen={isSidebarOpen}
            active={currentTab === 'Federated Search'}
          />
        </Link>

        <Link href="/map_search">
          <SidebarItem
            icon={<LocateFixed size={18} />}
            // icon={<Triangle size={18} />}
            label="Map Search"
            isOpen={isSidebarOpen}
            active={currentTab === 'Map Search'}
          />
        </Link>

        <Link href="/contribute">
          <SidebarItem
            icon={<DatabaseZap size={18} />}
            label="Contribute"
            isOpen={isSidebarOpen}
            active={currentTab === 'Contribute'}
          />
        </Link>
        <Link href="/datasets">
          <SidebarItem
            icon={<FileText size={18} />}
            label="Datasets"
            isOpen={isSidebarOpen}
            active={currentTab === 'Datasets'}
          />
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
