'use client';

import {
  Menu,
  ChevronLeft,
  Globe,
  LayoutDashboard,
  DatabaseZap,
  LocateFixed,
  FileText,
  FileSearch,
  Network,
  Settings,
} from 'lucide-react';
import React, { useState, ReactNode } from 'react';
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
        active ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
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

  // Expose sidebar width for full-width content panels (e.g. dataset detail sheet)
  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isSidebarOpen ? "13rem" : "4rem"
    );
  }, [isSidebarOpen]);

  const getCurrentTab = (): string => {
    if (pathname === '/') return 'Dashboard';
    if (pathname === '/federated_search') return 'Explore Datasets';
    if (pathname === '/map_search') return 'Map Search';
    if (pathname === '/contribute') return 'Contribute';
    if (pathname === '/datasets') return 'Datasets';
    if (pathname === '/ontology') return 'Ontology';
    if (pathname === '/metadata_search') return 'Metadata Search';
    if (pathname === '/map_module') return 'Map Module';
    if (pathname === '/settings') return 'Settings';
    return '';
  };

  const currentTab = getCurrentTab();

  return (
    <div
      className={`bg-card text-foreground border-r border-border shadow-md transition-all duration-300 ${
        isSidebarOpen ? 'w-52' : 'w-16'
      } h-screen flex flex-col`}
    >
      {/* Toggle Button */}
      <div className="p-3 border-b border-border flex justify-between items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-muted"
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
            label="Explore Datasets"
            isOpen={isSidebarOpen}
            active={currentTab === 'Explore Datasets'}
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

        <Link href="/ontology">
          <SidebarItem
            icon={<Network size={18} />}
            label="Ontology"
            isOpen={isSidebarOpen}
            active={currentTab === 'Ontology'}
          />
        </Link>

        <Link href="/metadata_search">
          <SidebarItem
            icon={<FileSearch size={18} />}
            label="Metadata Search"
            isOpen={isSidebarOpen}
            active={currentTab === 'Metadata Search'}
          />
        </Link>

        <Link href="/settings">
          <SidebarItem
            icon={<Settings size={18} />}
            label="Settings"
            isOpen={isSidebarOpen}
            active={currentTab === 'Settings'}
          />
        </Link>

        {/* <Link href="/map_module">
          <SidebarItem
            icon={<Map size={18} />}
            label="Map Module"
            isOpen={isSidebarOpen}
            active={currentTab === 'Map Module'}
          />
        </Link> */}
      </div>
    </div>
  );
};

export default Sidebar;
