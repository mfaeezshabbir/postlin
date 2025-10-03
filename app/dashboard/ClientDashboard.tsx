"use client";

import { useSession, signOut } from 'next-auth/react';

export default function ClientDashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>{session?.user?.name || session?.user?.email}</strong>
          <div style={{ fontSize: 12, color: '#666' }}>{session?.user?.email}</div>
        </div>
        <div>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{ padding: '6px 10px', background: '#eee', border: 'none', borderRadius: 6 }}>
            Sign out
          </button>
        </div>
      </div>
      <pre style={{ marginTop: 16, background: '#f7f7f7', padding: 12, borderRadius: 6 }}>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
