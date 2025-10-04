"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  Clock, 
  History, 
  Settings, 
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name?: string;
  email?: string;
  linkedInId?: string | null;
}

interface DashboardSidebarProps {
  user: User;
}

const navigation = [
  { name: 'Drafts', href: '/dashboard/drafts', icon: FileText },
  { name: 'Scheduled', href: '/dashboard/scheduled', icon: Clock },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">Postli</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-[57px]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-[57px] bottom-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent pathname={pathname} isCollapsed={false} />
      </aside>

      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Postli</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <SidebarContent pathname={pathname} isCollapsed={isCollapsed} />
      </aside>
    </>
  );
}

function SidebarContent({ pathname, isCollapsed }: { pathname: string; isCollapsed: boolean }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            )}
            title={isCollapsed ? item.name : undefined}
          >
            <Icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-5 w-5")} />
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
