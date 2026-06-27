import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccidentForm from "@/components/accident-form";

export default async function AccidentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/accident");

  return <AccidentForm />;
}
