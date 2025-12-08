import { headers } from "next/headers";
import getCurrentUser from "../../lib/auth";
import ClientNavbar from "./ClientNavbar";

// Server component: fetch the current user and render the client navbar.
export default async function Navbar() {
  const user = await getCurrentUser();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Hide navbar on dashboard routes
  const isDashboard = pathname.startsWith("/dashboard");
  
  return <ClientNavbar user={user} isDashboard={isDashboard} />;
}
