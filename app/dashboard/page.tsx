import getCurrentUser from '../../lib/auth';
import ClientDashboard from './ClientDashboard';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div>
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome, {user.name || user.email}</h1>
      <p>Your LinkedIn ID: {user.linkedInId}</p>
      <div style={{ marginTop: 24 }}>
        {/* Client component handles sign out and shows session */}
        <ClientDashboard />
      </div>
    </div>
  );
}
