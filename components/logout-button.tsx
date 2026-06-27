"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-rose-600 active:scale-[0.98]"
    >
      로그아웃
    </button>
  );
}
