import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";

export const authRequire = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");
};
export const unauthRequire = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    let redirectPath = "/workflows";
    redirect(redirectPath);
  }
};