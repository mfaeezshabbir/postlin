import getCurrentUser from '../../lib/auth';
import ClientDashboard from './ClientDashboard';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return <ClientDashboard user={user} />;
}
