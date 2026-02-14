import { unauthRequire } from "@/lib/auth-utils";

export default async function AuthLayout({ children }) {
    await unauthRequire();
  return (
    <section>
      {children}
    </section>
  );
}
