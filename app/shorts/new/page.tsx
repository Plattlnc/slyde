import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ShortUploadForm from "@/components/short-upload-form";

export default async function NewShortPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/shorts/new");

  return <ShortUploadForm />;
}
