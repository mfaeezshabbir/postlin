import { useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  hasGoogleAuth: boolean;
  hasLinkedInAuth: boolean;
  linkedInConnected: boolean;
  hasGeminiKey: boolean;
  geminiKeyAddedAt?: Date | null;
  createdAt: Date;
  features: {
    canUseGemini: boolean;
    canPostToLinkedIn: boolean;
    canUseManualPosting: boolean;
  };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
}
