"use client";

import { useEffect, useMemo, useState } from "react";
import * as am5 from "@amcharts/amcharts5";

import useGetErrorDataList from "@/_shared/api/services/type-2/useGetErrorDataList";
import useDataCdStore from "@/_shared/store/type-2/dataCd";
import Chart from "@/_shared/utils/charts/Chart";
import {
  stripPlot,
  StripPlotCategoryMeta,
  StripPlotPoint,
} from "@/_shared/utils/charts/stripPlot/stripPlot";

export default function StripPlot() {
  const { dataCd, assetCd } = useDataCdStore();

  const { data } = useGetErrorDataList(dataCd, assetCd);

  // ---------------- Tooltip 폰트 사이즈 (lg 기준 반응형) ----------------
  const computeTooltipFontSize = () =>
    typeof window !== "undefined" && window.innerWidth < 1024 ? 10 : 12;
  const [tooltipFontSize, setTooltipFontSize] = useState<number>(
    computeTooltipFontSize(),
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const ns = computeTooltipFontSize();
        setTooltipFontSize(prev => (prev === ns ? prev : ns));
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const categories: StripPlotCategoryMeta[] = useMemo(() => {
    if (!data || !data.length) return [];
    const palette = [
      0x67b7dc, 0x6794dc, 0x6771dc, 0x8067dc, 0xa367dc, 0xc767dc, 0xdc67ce,
      0xdc67c0, 0xdc67a4, 0xdc6788, 0xdc676c, 0xdc6750, 0xdc6734, 0xdc6718,
    ];
    const codesSet = new Set<string>();
    for (const row of data) {
      Object.keys(row || {}).forEach(k => {
        if (k.endsWith("_size")) {
          const code = k.slice(0, -5);
          codesSet.add(code);
        }
      });
    }
    const codes = Array.from(codesSet).sort(); // 정렬로 안정성 확보
    return codes.map((code, idx) => ({
      category: code,
      color: am5.color(palette[idx % palette.length]),
    }));
  }, [data]);

  let xMin = Number.POSITIVE_INFINITY;
  let xMax = Number.NEGATIVE_INFINITY;
  const xLabelMap: Record<number, string> = {};

  const TableData: StripPlotPoint[] | undefined = data?.flatMap((row: any) => {
    const dtmRaw: string | undefined = row?.DTM;
    let ts = NaN;
    if (dtmRaw) {
      const iso = dtmRaw.replace(" ", "T");
      ts = Date.parse(iso);
    }
    if (isNaN(ts)) {
      ts = Date.now();
    }
    const dateObj = new Date(ts);

    // 59분부터 시작해서 5분 단위로만 남기고 나머지 제거
    const minute = dateObj.getMinutes();
    const base = 59;
    const allowed = [];
    for (let i = 0; i < 12; i++) {
      allowed.push((base + i * 5) % 60);
    }
    if (!allowed.includes(minute)) return [];

    if (ts < xMin) xMin = ts;
    if (ts > xMax) xMax = ts;
    const label = `${String(dateObj.getHours()).padStart(2, "0")}:${String(
      dateObj.getMinutes(),
    ).padStart(2, "0")}`;
    if (!xLabelMap[ts]) xLabelMap[ts] = label;
    const dtLabel = `${dateObj.getFullYear()}-${String(
      dateObj.getMonth() + 1,
    ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")} ${String(
      dateObj.getHours(),
    ).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;

    return categories.map(cat => {
      const sizeKey = `${cat.category}_size`;
      const valueKey = `${cat.category}_value`;
      const rawSize = row?.[sizeKey];
      const rawVal = row?.[valueKey];
      const sizeNum = rawSize == null ? 0 : Number(rawSize);
      const valNum = rawVal == null ? null : Number(rawVal);
      return {
        category: cat.category,
        position: ts,
        value: isNaN(sizeNum) ? 0 : sizeNum,
        displayValue: isNaN(valNum as number) ? undefined : valNum,
        dtLabel,
      } as any;
    });
  });

  if (xMin === Number.POSITIVE_INFINITY || xMax === Number.NEGATIVE_INFINITY) {
    // 데이터 없을 때 기본 범위 설정 (현재 시간 기준 5분 범위)
    const now = Date.now();
    xMin = now - 2.5 * 60 * 1000;
    xMax = now + 2.5 * 60 * 1000;
  }

  // 여유 buffer (앞뒤 30초)
  const BUFFER = 30 * 1000;
  const axisMin = xMin - BUFFER;
  const axisMax = xMax + BUFFER;

  // Chart 래퍼는 (id, data)만 넘기므로 options 주입을 위해 래핑 함수 생성
  const create = (id: string, d: StripPlotPoint[]) => {
    const chartObj = stripPlot(id, d, {
      categories,
      min: axisMin,
      max: axisMax,
      strictMinMax: true,
      // value(반경) 대신 *_value 값(displayValue) 출력
      // amCharts BBCode fontSize 태그로 반응형 적용
      tooltipText: `[fontSize: ${tooltipFontSize}px]{dtLabel}[/]\n[fontSize: ${tooltipFontSize}px]{category}: {displayValue}[/]`,
      showScrollbars: true, // 내부 스크롤바 사용
      minRadius: 3,
      maxRadius: 10,
      xLabelMap,
      xLabelRotation: -40,
    });

    // ---------------- 스크롤 기반 Y축 표시 전략 ----------------
    // 많은 카테고리가 있을 때 높이 늘리지 않고 일부만 viewport에 두고 스크롤로 탐색
    const MAX_VISIBLE = 18; // 초기 한 화면에 보여줄 최대 카테고리 수 (조정 가능)
    if (categories.length > MAX_VISIBLE) {
      // endIndex 는 포함/미포함 차이가 라이브러리 minor version 별 약간 다를 수 있어 약간 여유
      try {
        chartObj.yAxis.zoomToIndexes(0, MAX_VISIBLE - 1);
      } catch (_) {
        /* ignore */
      }
    }
    return chartObj;
  };

  return (
    <>
      {/* 높이 부모 컨테이너에 의해 결정 (기존 구조로 복구) */}
      <Chart createChart={create} id="strip-plot" data={TableData} />
    </>
  );
}
