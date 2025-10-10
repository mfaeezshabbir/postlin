import getCurrentUser from "../../lib/auth";
import ClientNavbar from "./ClientNavbar";

// Server component: fetch the current user and render the client navbar.
export default async function Navbar() {
  const user = await getCurrentUser();
  return <ClientNavbar user={user} />;
}
