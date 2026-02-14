import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  if (session.user?.role === "Resident") {
    redirect("/resident");
  } else if (session.user?.role === "CommunityLeader" || session.user?.role === "community leader" || session.user?.role === "Leader") {
    redirect("/leader");
  } else {
    redirect("/login");
  }

  return null;
}
