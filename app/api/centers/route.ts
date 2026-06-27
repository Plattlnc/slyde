import { NextRequest, NextResponse } from "next/server";

// 카카오 로컬 키워드 검색 (REST 키는 서버에서만 사용 → 노출 X)
export async function GET(req: NextRequest) {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "no_rest_key" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const x = searchParams.get("x"); // 경도
  const y = searchParams.get("y"); // 위도
  if (!x || !y) {
    return NextResponse.json({ error: "no_coords" }, { status: 400 });
  }

  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", "오토바이 정비소");
  url.searchParams.set("x", x);
  url.searchParams.set("y", y);
  url.searchParams.set("radius", "5000");
  url.searchParams.set("sort", "distance");
  url.searchParams.set("size", "15");

  try {
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "kakao_error", status: res.status },
        { status: 502 },
      );
    }
    const data = await res.json();
    return NextResponse.json({ documents: data.documents ?? [] });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
