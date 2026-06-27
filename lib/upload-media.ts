import { createClient } from "@/lib/supabase/client";

// 게시글 첨부 이미지들을 Storage('shorts' 버킷, uid/post/ 폴더)에 올리고 공개 URL 반환
export async function uploadImages(files: File[]): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요");

  const urls: string[] = [];
  for (const f of files) {
    const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/post/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("shorts")
      .upload(path, f, { contentType: f.type });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from("shorts").getPublicUrl(path);
    urls.push(publicUrl);
  }
  return urls;
}
