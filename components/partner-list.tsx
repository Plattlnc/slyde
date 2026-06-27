"use client";

import { useState } from "react";
import { PARTNERS, PT_REGIONS } from "@/lib/extra-data";

export default function PartnerList() {
  const [sido, setSido] = useState("전체");
  const [gu, setGu] = useState("전체");

  const list = PARTNERS.filter((p) => {
    if (sido !== "전체" && p.sido !== sido) return false;
    if (sido !== "전체" && gu !== "전체" && p.gu !== gu) return false;
    return true;
  });
  const loc =
    sido === "전체" ? "전국" : gu !== "전체" ? `${sido} ${gu}` : `${sido} 전체`;

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">협력사 소개 · 프로모션 정책</p>
      <div className="mb-3 flex gap-2">
        <select
          value={sido}
          onChange={(e) => {
            setSido(e.target.value);
            setGu("전체");
          }}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="전체">시/도 전체</option>
          {Object.keys(PT_REGIONS).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={gu}
          onChange={(e) => setGu(e.target.value)}
          disabled={sido === "전체"}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm disabled:opacity-50"
        >
          <option value="전체">시·군·구 전체</option>
          {(PT_REGIONS[sido] ?? []).map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          총 <b className="text-slate-900">{list.length}개</b> 협력사
        </span>
        <span>{loc}</span>
      </div>

      {list.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">
          🔍 선택하신 지역에는 아직 등록된 협력사가 없어요.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border bg-white p-4 ${
                p.feat ? "border-blue-300 ring-1 ring-blue-100" : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏢</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{p.name}</span>
                    {p.feat && (
                      <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                        대표
                      </span>
                    )}
                    {p.hiring && (
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                        모집중
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{p.addr}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 py-2.5 text-center">
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {p.riders}명
                  </div>
                  <div className="text-[11px] text-slate-400">소속 라이더</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{p.daily}</div>
                  <div className="text-[11px] text-slate-400">일 평균 콜</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {p.accept}
                  </div>
                  <div className="text-[11px] text-slate-400">수락률</div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                {p.desc}
              </p>
              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="mb-1.5 text-xs font-bold text-slate-700">
                  🎯 협력사 프로모션
                </p>
                <ul className="space-y-1.5">
                  {p.promos.map((pr, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-600">
                      <span>{pr.i}</span>
                      {pr.t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
