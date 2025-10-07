import getCurrentUser from '../../lib/auth';
import { redirect } from 'next/navigation';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardTopbar from './components/DashboardTopbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <DashboardSidebar user={user} />
      <div className="lg:pl-64">
        <DashboardTopbar user={user} />
        <main className="py-8">
          <div className="app-container">
            <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-gray-100 p-8 shadow-sm">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
