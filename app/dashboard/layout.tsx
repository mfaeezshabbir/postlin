import getCurrentUser from "../../lib/auth";
import { redirect } from "next/navigation";
import ClientDashboardLayout from "./ClientDashboardLayout";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    // Client-driven layout handles collapse state and content padding
    <ClientDashboardLayout user={user}>{children}</ClientDashboardLayout>
  );
}
