import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ComposeForm from "@/components/compose-form";

export default async function ComposePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인 시 로그인으로
  if (!user) redirect("/login?next=/compose");

  return <ComposeForm />;
}
