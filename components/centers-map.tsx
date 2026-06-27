"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fmtDistance, DEFAULT_POS, type KakaoPlace } from "@/lib/centers";

let sdkPromise: Promise<any> | null = null;
function loadKakaoSdk(jsKey: string): Promise<any> {
  if ((window as any).kakao?.maps) return Promise.resolve((window as any).kakao);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false`;
    s.async = true;
    s.onload = () =>
      (window as any).kakao.maps.load(() => resolve((window as any).kakao));
    s.onerror = () => reject(new Error("지도 SDK 로드 실패"));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

export default function CentersMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [listStatus, setListStatus] = useState<
    "loading" | "ready" | "error" | "no_rest_key" | "empty"
  >("loading");
  const [mapStatus, setMapStatus] = useState<
    "loading" | "ready" | "no_js_key" | "error"
  >("loading");
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    let cancelled = false;

    async function run(lat: number, lng: number) {
      // 1) 검색 (서버 라우트 → 카카오 REST)
      try {
        const res = await fetch(`/api/centers?x=${lng}&y=${lat}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.error === "no_rest_key") {
          setListStatus("no_rest_key");
        } else if (!res.ok || !data.documents) {
          setListStatus("error");
        } else {
          const docs: KakaoPlace[] = data.documents;
          setPlaces(docs);
          setListStatus(docs.length ? "ready" : "empty");
          // 2) 지도
          if (!jsKey) {
            setMapStatus("no_js_key");
          } else {
            try {
              const kakao = await loadKakaoSdk(jsKey);
              if (cancelled || !mapRef.current) return;
              const center = new kakao.maps.LatLng(lat, lng);
              const map = new kakao.maps.Map(mapRef.current, {
                center,
                level: 5,
              });
              // 내 위치
              new kakao.maps.Marker({
                map,
                position: center,
                image: new kakao.maps.MarkerImage(
                  "data:image/svg+xml;base64," +
                    btoa(
                      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="7" fill="#2563eb" stroke="#fff" stroke-width="3"/></svg>`,
                    ),
                  new kakao.maps.Size(20, 20),
                ),
              });
              // 정비소 마커
              docs.forEach((p) => {
                new kakao.maps.Marker({
                  map,
                  position: new kakao.maps.LatLng(Number(p.y), Number(p.x)),
                  title: p.place_name,
                });
              });
              setMapStatus("ready");
            } catch {
              setMapStatus("error");
            }
          }
        }
      } catch {
        if (!cancelled) setListStatus("error");
      }
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
      {mapStatus === "no_js_key" ? (
        <div className="m-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          지도 JS 키가 설정되지 않았어요.
          <span className="block text-xs">
            (NEXT_PUBLIC_KAKAO_JS_KEY 설정 + 도메인 등록 필요)
          </span>
        </div>
      ) : (
        <div className="relative h-64 w-full bg-slate-200">
          <div ref={mapRef} className="h-full w-full" />
          {mapStatus === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
              지도 불러오는 중…
            </div>
          )}
        </div>
      )}

      {denied && (
        <p className="px-4 pt-2 text-[11px] text-slate-400">
          * 위치 권한이 없어 서울시청 기준으로 검색했어요.
        </p>
      )}

      {/* 긴급출동 (가장 가까운 곳) */}
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

      {listStatus === "no_rest_key" && (
        <p className="px-4 py-6 text-center text-sm text-amber-700">
          검색 REST 키가 설정되지 않았어요 (KAKAO_REST_API_KEY)
        </p>
      )}
      {listStatus === "error" && (
        <p className="px-4 py-6 text-center text-sm text-rose-600">
          검색에 실패했어요. 키/네트워크를 확인해주세요.
        </p>
      )}
      {listStatus === "loading" && (
        <p className="px-4 py-6 text-center text-sm text-slate-400">
          검색 중…
        </p>
      )}
      {listStatus === "empty" && (
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
