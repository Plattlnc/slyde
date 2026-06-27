"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fmtDistance, DEFAULT_POS, type KakaoPlace } from "@/lib/centers";

let sdkPromise: Promise<any> | null = null;
function loadKakaoSdk(jsKey: string): Promise<any> {
  if ((window as any).kakao?.maps?.services)
    return Promise.resolve((window as any).kakao);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    // services 라이브러리 포함 → 키워드 장소검색을 JS 키로 클라에서 수행
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false&libraries=services`;
    s.async = true;
    s.onload = () =>
      (window as any).kakao.maps.load(() => resolve((window as any).kakao));
    s.onerror = () => reject(new Error("지도 SDK 로드 실패"));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

type Status = "loading" | "ready" | "empty" | "no_js_key" | "error";

export default function CentersMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!jsKey) {
      setStatus("no_js_key");
      return;
    }
    let cancelled = false;

    async function run(lat: number, lng: number) {
      let kakao: any;
      try {
        kakao = await loadKakaoSdk(jsKey as string);
      } catch {
        if (!cancelled) setStatus("error");
        return;
      }
      if (cancelled || !mapRef.current) return;

      const me = new kakao.maps.LatLng(lat, lng);
      const map = new kakao.maps.Map(mapRef.current, { center: me, level: 5 });

      // 내 위치 마커
      new kakao.maps.Marker({
        map,
        position: me,
        image: new kakao.maps.MarkerImage(
          "data:image/svg+xml;base64," +
            btoa(
              `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="7" fill="#2563eb" stroke="#fff" stroke-width="3"/></svg>`,
            ),
          new kakao.maps.Size(20, 20),
        ),
      });

      // 키워드 장소검색 (services)
      const ps = new kakao.maps.services.Places();
      ps.keywordSearch(
        "오토바이 정비소",
        (data: KakaoPlace[], st: string) => {
          if (cancelled) return;
          if (st === kakao.maps.services.Status.OK) {
            setPlaces(data);
            setStatus(data.length ? "ready" : "empty");
            const bounds = new kakao.maps.LatLngBounds();
            bounds.extend(me);
            data.forEach((p) => {
              const pos = new kakao.maps.LatLng(Number(p.y), Number(p.x));
              new kakao.maps.Marker({ map, position: pos, title: p.place_name });
              bounds.extend(pos);
            });
            if (data.length) map.setBounds(bounds);
          } else if (st === kakao.maps.services.Status.ZERO_RESULT) {
            setStatus("empty");
          } else {
            setStatus("error");
          }
        },
        {
          location: me,
          radius: 5000,
          sort: kakao.maps.services.SortBy.DISTANCE,
          size: 15,
        },
      );
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => run(pos.coords.latitude, pos.coords.longitude),
        () => {
          setDenied(true);
          run(DEFAULT_POS.lat, DEFAULT_POS.lng);
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    } else {
      setDenied(true);
      run(DEFAULT_POS.lat, DEFAULT_POS.lng);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const nearest = places[0];

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      {/* 상단 바 */}
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link href="/" aria-label="뒤로" className="text-xl active:scale-90">
            ←
          </Link>
          <span className="text-base font-extrabold text-slate-900">
            🔧 내 주변 정비소
          </span>
        </div>
      </header>

      {/* 지도 */}
      {status === "no_js_key" ? (
        <div className="m-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          카카오 지도 JS 키가 설정되지 않았어요.
          <span className="block text-xs">
            (NEXT_PUBLIC_KAKAO_JS_KEY + JavaScript 키에 SDK 도메인 등록 필요)
          </span>
        </div>
      ) : (
        <div className="relative h-64 w-full bg-slate-200">
          <div ref={mapRef} className="h-full w-full" />
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
              지도·검색 불러오는 중…
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-rose-600">
              지도를 불러오지 못했어요. JS 키/도메인 등록을 확인해주세요.
            </div>
          )}
        </div>
      )}

      {denied && status !== "no_js_key" && (
        <p className="px-4 pt-2 text-[11px] text-slate-400">
          * 위치 권한이 없어 서울시청 기준으로 검색했어요.
        </p>
      )}

      {/* 긴급출동 */}
      {nearest && nearest.phone && (
        <div className="px-4 pt-3">
          <a
            href={`tel:${nearest.phone}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3.5 text-sm font-bold text-white active:scale-[0.98]"
          >
            🆘 긴급출동 — 가장 가까운 곳 연결 ({fmtDistance(nearest.distance)})
          </a>
        </div>
      )}

      {/* 목록 */}
      <p className="px-4 pb-1 pt-4 text-xs font-bold text-slate-500">
        거리순 정비소
      </p>
      {status === "empty" && (
        <p className="px-4 py-6 text-center text-sm text-slate-400">
          주변 5km 내 정비소를 찾지 못했어요.
        </p>
      )}
      <div className="divide-y divide-slate-100">
        {places.map((p) => (
          <div key={p.id} className="flex items-center gap-3 bg-white px-4 py-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
              🔧
            </div>
            <a
              href={p.place_url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1"
            >
              <p className="truncate text-sm font-semibold text-slate-900">
                {p.place_name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {p.road_address_name || p.address_name}
              </p>
              <p className="text-[11px] text-slate-400">
                {fmtDistance(p.distance)}
                {p.phone ? ` · ${p.phone}` : ""}
              </p>
            </a>
            {p.phone && (
              <a
                href={`tel:${p.phone}`}
                className="shrink-0 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white active:scale-95"
              >
                전화
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="h-6" />
    </div>
  );
}
