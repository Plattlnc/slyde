import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchNotifications } from "@/lib/notifications";
import NotificationList from "@/components/notification-list";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/notifications");

  const items = await fetchNotifications();

  return (
    <div className="min-h-full bg-slate-50">
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link href="/" aria-label="뒤로" className="text-xl active:scale-90">
            ←
          </Link>
          <span className="text-base font-extrabold text-slate-900">알림</span>
        </div>
      </header>
      <NotificationList items={items} />
    </div>
  );
}
