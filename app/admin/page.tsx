import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SiteShell } from "../components";
import { SESSION_COOKIE } from "../api/auth-check";
import { isSessionValid } from "../api/sessions-store";
import { AdminPanel } from "./panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  if (!(await isSessionValid(session))) {
    redirect("/admin/login");
  }

  return (
    <SiteShell>
      <section className="admin-hero">
        <p className="eyebrow">Admin</p>
        <h1>Նյութերի կառավարում</h1>
        <p>Ավելացնել, խմբագրել և հեռացնել նյութեր կայքի ցանկացած բաժնի համար։</p>
      </section>
      <AdminPanel />
    </SiteShell>
  );
}
