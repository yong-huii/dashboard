"use client";

import { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";

interface Props {
  data?: any;
  createChart: (id: string, data: any) => any; // 결과 객체( root, series ... ) 예상
  id: string;
}

/** 공통 차트 래퍼: 대용량 데이터 렌더링 지연 시 로딩 오버레이 표시 */
export default function Chart({ data, createChart, id }: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let disposed = false;
    let rootWrapper: any = null;
    setLoading(true); // 새 데이터 -> 로딩 시작

    // 기존 root 정리 (SSR 안전)
    if (typeof window !== "undefined") {
      const w = window as any;
      if (w.am5?.registry?.rootElements) {
        w.am5.array.each(w.am5.registry.rootElements, function (root: any) {
          if (root.dom.id === id) root.dispose();
        });
      }
    }

    // 렌더 트리 먼저 commit 후 무거운 chart 생성 -> 스피너 먼저 그려지도록 setTimeout/RAF 사용
    const scheduleHandle = window.requestAnimationFrame(() => {
      try {
        const result = createChart(id, data);
        rootWrapper = result?.root || result; // am5: {root,...}, am4: chart 자체 반환

        let settled = false;
        const startedAt = performance.now();
        const MIN_VISIBLE_MS = 120; // 너무 빨리 사라져 깜박임 방지
        const settle = () => {
          if (!disposed && !settled) {
            settled = true;
            const elapsed = performance.now() - startedAt;
            if (elapsed < MIN_VISIBLE_MS) {
              setTimeout(
                () => !disposed && setLoading(false),
                MIN_VISIBLE_MS - elapsed,
              );
            } else {
              setLoading(false);
            }
          }
        };

        // 1) amCharts5 LineSeries 등: datavalidated
        const maybeSeries = result?.series;
        const candidateSeries: any[] = [];
        if (maybeSeries) candidateSeries.push(maybeSeries);

        // am4 chart.series (list) 처리
        if (result?.series?.each) {
          try {
            result.series.each((s: any) => candidateSeries.push(s));
          } catch (_) {}
        } else if (Array.isArray(result?.series)) {
          candidateSeries.push(...result.series);
        }

        const EVENT_ORDER = [
          "datavalidated", // amCharts5
          "validated", // amCharts4 (series)
          "inited", // 초기화 완료
        ];

        const attachOnObject = (obj: any) => {
          if (!obj?.events) return false;
          for (const ev of EVENT_ORDER) {
            try {
              if (obj.events.once) {
                obj.events.once(ev, settle);
                return true;
              } else if (obj.events.on) {
                // am4도 once 지원하지만 혹시 대비
                obj.events.on(ev, () => settle(), undefined, true);
                return true;
              }
            } catch (_) {
              /* ignore */
            }
          }
          return false;
        };

        let attached = false;
        for (const s of candidateSeries) {
          if (attachOnObject(s)) {
            attached = true;
            break;
          }
        }

        // 2) am4 chart 자체 ready 이벤트
        if (!attached && result?.events) {
          try {
            if (result.events.once) {
              result.events.once("ready", settle);
              attached = true;
            } else if (result.events.on) {
              result.events.on("ready", () => settle(), undefined, true);
              attached = true;
            }
          } catch (_) {}
        }

        // 3) 조기 fallback: 400ms 후에도 이벤트 안 오면 일단 숨김 (am4 ready 지연 완화)
        const earlyFallbackTimer = setTimeout(settle, 400);
        // 4) 최종 안전장치: 3초 강제 해제
        const safetyTimer = setTimeout(settle, 3000);

        // microtask fallback (아주 가벼운 차트 즉시 렌더)
        if (!attached) Promise.resolve().then(settle);

        // dispose 시 타이머 정리
        rootWrapper.___loadingSafetyTimer = safetyTimer;
        rootWrapper.___loadingEarlyTimer = earlyFallbackTimer;
      } catch (e) {
        console.error("[Chart] createChart threw:\n", e);
        if (!disposed) setLoading(false);
      }
    });

    return () => {
      disposed = true;
      try {
        if (scheduleHandle) cancelAnimationFrame(scheduleHandle);
        if (rootWrapper?.___loadingSafetyTimer)
          clearTimeout(rootWrapper.___loadingSafetyTimer);
        if (rootWrapper?.___loadingEarlyTimer)
          clearTimeout(rootWrapper.___loadingEarlyTimer);
        rootWrapper?.dispose?.();
      } catch (_) {
        // ignore
      }
    };
  }, [data, createChart, id]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.55)",
            zIndex: 10,
            backdropFilter: "blur(2px)",
          }}
        >
          <LoadingOutlined style={{ fontSize: 36, color: "#555879" }} />
        </div>
      )}
      <div id={id} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
