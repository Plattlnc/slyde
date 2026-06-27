import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CameraCreate from "@/components/camera-create";

export default async function CreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/create");

  return <CameraCreate />;
}
