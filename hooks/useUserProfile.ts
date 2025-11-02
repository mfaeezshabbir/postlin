import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  googleId: string | null;
  linkedInConnected: boolean;
  hasGeminiKey: boolean;
  geminiKeyAddedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useUserProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [status]);

  return {
    profile,
    loading,
    error,
    refetch,
    isAuthenticated: status === 'authenticated',
    hasGeminiKey: profile?.hasGeminiKey || false,
    linkedInConnected: profile?.linkedInConnected || false,
  };
}
