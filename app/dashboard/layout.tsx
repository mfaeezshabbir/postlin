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
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={user} />
      <div className="lg:pl-64">
        <DashboardTopbar user={user} />
        <main className="py-6">
          <div className="app-container">
            <div className="rounded-2xl bg-card/70 backdrop-blur-sm p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
