"use client";

import { signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name?: string;
  email?: string;
  linkedInId?: string | null;
  image?: string;
}

interface DashboardTopbarProps {
  user: User;
}

export default function DashboardTopbar({ user }: DashboardTopbarProps) {
  const router = useRouter();

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-4 z-30 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-gray-100 shadow-sm">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 hidden sm:block">
              Welcome back, {user.name?.split(' ')[0] || 'there'}!
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push('/dashboard/drafts')}
              className="hidden sm:inline-flex bg-gradient-to-r from-indigo-600 to-pink-600 text-white"
            >
              New Draft
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image} alt={user.name || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email || 'No email'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
