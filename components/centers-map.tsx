"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  nearbyCenters,
  fmtDistance,
  fmtPhone,
  DEFAULT_POS,
  type Center,
} from "@/lib/centers";

let mapsPromise: Promise<void> | null = null;
function loadGoogleMaps(key: string): Promise<void> {
  if ((window as any).google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("지도 로드 실패"));
    document.head.appendChild(s);
  });
  return mapsPromise;
}

type Status = "loading" | "ready" | "nokey" | "error";

export default function CentersMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [centers, setCenters] = useState<Center[]>([]);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setStatus("nokey");
      return;
    }

    let cancelled = false;

    function start(lat: number, lng: number) {
      loadGoogleMaps(key as string)
        .then(() => {
          if (cancelled || !mapRef.current) return;
          const google = (window as any).google;
          const map = new google.maps.Map(mapRef.current, {
            center: { lat, lng },
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: true,
          });
          // 내 위치
          new google.maps.Marker({
            position: { lat, lng },
            map,
            title: "내 위치",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#2563eb",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2,
            },
          });
          const list = nearbyCenters(lat, lng);
          list.forEach((c) => {
            new google.maps.Marker({
              position: { lat: c.lat, lng: c.lng },
              map,
              title: c.name,
            });
          });
          setCenters(list);
          setStatus("ready");
        })
        .catch(() => !cancelled && setStatus("error"));
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => start(pos.coords.latitude, pos.coords.longitude),
        () => {
          // 거부/실패 → 기본 위치(서울시청)
          setDenied(true);
          start(DEFAULT_POS.lat, DEFAULT_POS.lng);
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    } else {
      setDenied(true);
      start(DEFAULT_POS.lat, DEFAULT_POS.lng);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const nearest = centers[0];

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

      {/* 지도 영역 */}
      {status === "nokey" ? (
        <div className="m-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          지도 API 키가 설정되지 않았어요.
          <br />
          <span className="text-xs">
            (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 설정 필요)
          </span>
        </div>
      ) : status === "error" ? (
        <div className="m-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          지도를 불러오지 못했어요. 키/네트워크를 확인해주세요.
        </div>
      ) : (
        <div className="relative h-64 w-full bg-slate-200">
          <div ref={mapRef} className="h-full w-full" />
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
              위치 확인 중…
            </div>
          )}
        </div>
      )}

      {denied && status === "ready" && (
        <p className="px-4 pt-2 text-[11px] text-slate-400">
          * 위치 권한이 없어 기본 위치(서울시청) 기준으로 표시했어요.
        </p>
      )}

      {/* 긴급출동 */}
      {nearest && (
        <div className="px-4 pt-3">
          <a
            href={`tel:${nearest.phone}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3.5 text-sm font-bold text-white active:scale-[0.98]"
          >
            🆘 긴급출동 — 가장 가까운 센터 연결 ({fmtDistance(nearest.distanceM)})
          </a>
        </div>
      )}

      {/* 목록 */}
      <p className="px-4 pb-1 pt-4 text-xs font-bold text-slate-500">
        거리순 정비소
      </p>
      <div className="divide-y divide-slate-100">
        {centers.map((c) => (
          <div key={c.id} className="flex items-center gap-3 bg-white px-4 py-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
              {c.type === "협력센터" ? "🤝" : c.type === "정비소" ? "🔧" : "🏢"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {c.name}
              </p>
              <p className="text-xs text-slate-500">
                {c.type} · {fmtDistance(c.distanceM)} · {fmtPhone(c.phone)}
              </p>
            </div>
            <a
              href={`tel:${c.phone}`}
              className="shrink-0 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white active:scale-95"
            >
              전화
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 active:scale-95"
            >
              길찾기
            </a>
          </div>
        ))}
      </div>
      <div className="h-6" />
    </div>
  );
}
