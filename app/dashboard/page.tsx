import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect /dashboard to /dashboard/drafts
  redirect('/dashboard/drafts');
}
