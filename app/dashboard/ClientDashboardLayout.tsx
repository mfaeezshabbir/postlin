"use client";

import { useEffect, useState } from 'react';
import DashboardSidebar from './components/DashboardSidebar';

export default function ClientDashboardLayout({ user, children }: { user: any; children: React.ReactNode; }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLarge, setIsLarge] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsLarge(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // compute left padding for large screens only
  const leftPadding = isLarge ? (isCollapsed ? '5rem' : '16rem') : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <DashboardSidebar user={user} isCollapsed={isCollapsed} onCollapsedChange={setIsCollapsed} />

      <div
        style={{ paddingLeft: leftPadding, transition: 'padding-left 220ms cubic-bezier(0.2,0.8,0.2,1)' }}
      >
        <main className="py-8 transition-all">
          <div className="app-container">
            <div className={"rounded-3xl bg-white/70 backdrop-blur-md border border-gray-100 p-8 shadow-sm transition-shadow duration-200 " + (isCollapsed ? '' : 'lg:translate-x-0 lg:shadow-2xl')}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
