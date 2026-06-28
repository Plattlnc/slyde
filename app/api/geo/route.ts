import { NextResponse } from "next/server";

// 좌표 → 지역명 (카카오 역지오코딩)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  if (!lat || !lng) {
    return NextResponse.json({ error: "좌표 없음" }, { status: 400 });
  }
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return NextResponse.json({ region: null });
  try {
    const r = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
      { headers: { Authorization: `KakaoAK ${key}` } },
    );
    const d = await r.json();
    const doc = d.documents?.[0];
    const region = doc
      ? [doc.region_1depth_name, doc.region_2depth_name, doc.region_3depth_name]
          .filter(Boolean)
          .join(" ")
      : null;
    return NextResponse.json({ region });
  } catch {
    return NextResponse.json({ region: null });
  }
}
