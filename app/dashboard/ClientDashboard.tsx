"use client";

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import Logo from '@/components/brand/Logo';
import {
  Loader2,
  LogOut,
  FileText,
  CheckCircle,
  BarChart2,
  Plus,
  Settings,
  User,
  Mail,
  Linkedin,
} from 'lucide-react';

interface User {
  id: string;
  name?: string;
  email?: string;
  linkedInId?: string | null;
}

interface ClientDashboardProps {
  user: User;
}

export default function ClientDashboard({ user }: ClientDashboardProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header / Navigation */}
      <header className="sticky top-4 z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-pink-600 text-white">
                <Logo className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Postlin</h1>
                <p className="text-xs text-gray-500">AI Content Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span className="text-sm">Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 rounded-2xl p-6 bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user.name?.split(' ')[0] || 'there'}!</h2>
              <p className="text-sm opacity-90">Create, schedule, and publish content — all from one place.</p>
            </div>
            <div>
              <button onClick={() => {}} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold shadow hover:opacity-95">New Draft</button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 rounded-2xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">0</h3>
                <p className="text-sm text-gray-600">Draft Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 rounded-2xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">0</h3>
                <p className="text-sm text-gray-600">Published Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 rounded-2xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">0</h3>
                <p className="text-sm text-gray-600">Total Impressions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 rounded-2xl shadow p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all group border border-transparent hover:border-indigo-100">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <Plus className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">New Draft</p>
                <p className="text-xs text-gray-500">Create AI content</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all group border border-transparent hover:border-purple-100">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Preferences</p>
                <p className="text-xs text-gray-500">Customize AI tone</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all group border border-transparent hover:border-green-100">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <BarChart2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-xs text-gray-500">View insights</p>
              </div>
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white/70 rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{user.name || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user.email || 'Not set'}</p>
              </div>
            </div>
            {user.linkedInId && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">LinkedIn Connected</p>
                  <p className="text-sm font-medium text-gray-900">ID: {user.linkedInId.substring(0, 12)}...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
