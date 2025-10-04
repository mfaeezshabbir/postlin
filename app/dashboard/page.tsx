import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to drafts by default
  redirect('/dashboard/drafts');
}
