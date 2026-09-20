import { cookies } from "next/headers";
import { AdminClient } from "@/components/AdminClient";
import { AdminLoginClient } from "@/components/AdminLoginClient";
import { verifyAdminJwt } from "@/lib/adminAuth";

export default async function HiddenAdminPage() {
  const cookieStore = await cookies();
  const session = verifyAdminJwt(cookieStore.get("uet_admin_jwt")?.value);

  if (!session) {
    return <AdminLoginClient />;
  }

  return <AdminClient />;
}
