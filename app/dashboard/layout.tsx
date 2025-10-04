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
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar user={user} />
      <div className="lg:pl-64">
        <DashboardTopbar user={user} />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
