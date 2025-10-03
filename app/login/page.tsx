"use client";

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: 16 }}>Sign in to Postli</h1>
        <button
          onClick={async () => {
            setLoading(true);
            try {
              await signIn('linkedin', { callbackUrl: '/dashboard' });
            } finally {
              setLoading(false);
            }
          }}
          style={{ display: 'inline-block', padding: '10px 16px', background: '#0A66C2', color: 'white', borderRadius: 6, textDecoration: 'none', border: 'none', cursor: 'pointer' }}
          disabled={loading}
        >
          {loading ? 'Redirecting…' : 'Sign in with LinkedIn'}
        </button>
        <p style={{ marginTop: 12, color: '#666' }}>
          By signing in you agree to allow Postli to access your basic LinkedIn profile.
        </p>
      </div>
    </div>
  );
}
