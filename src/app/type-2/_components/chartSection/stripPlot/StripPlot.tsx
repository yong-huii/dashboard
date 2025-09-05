"use client";

import { useMemo } from "react";
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

  // 데이터 키에서 *_size 패턴을 추출하여 동적 카테고리 생성
  const categories: StripPlotCategoryMeta[] = useMemo(() => {
    if (!data || !data.length) return [];
    const palette = [
      0x67b7dc, 0x6794dc, 0x6771dc, 0x8067dc, 0xa367dc, 0xc767dc, 0xdc67ce,
      0xdc67c0, 0xdc67a4, 0xdc6788, 0xdc676c, 0xdc6750, 0xdc6734, 0xdc6718,
    ];
    const codesSet = new Set<string>();
    // 모든 row 순회 (첫 row만 쓰고 싶으면 data[0]으로 축소 가능)
    for (const row of data) {
      Object.keys(row || {}).forEach(k => {
        if (k.endsWith("_size")) {
          const code = k.slice(0, -5); // '_size' 제거
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

  // DTM을 실제 X축 값으로 사용 (timestamp ms)
  // value(버블 크기)는 *_size 사용
  // xLabelMap 으로 각 timestamp -> 'HH:mm' (또는 'mm') 라벨 제공
  let xMin = Number.POSITIVE_INFINITY;
  let xMax = Number.NEGATIVE_INFINITY;
  const xLabelMap: Record<number, string> = {};

  const TableData: StripPlotPoint[] | undefined = data?.flatMap((row: any) => {
    const dtmRaw: string | undefined = row?.DTM;
    let ts = NaN;
    if (dtmRaw) {
      // 'YYYY-MM-DD HH:mm:ss.s' 형식 -> ISO 변환
      const iso = dtmRaw.replace(" ", "T");
      ts = Date.parse(iso);
    }
    if (isNaN(ts)) {
      // fallback: 현재 시간 + 랜덤 offset (데이터 불량 예방)
      ts = Date.now();
    }
    if (ts < xMin) xMin = ts;
    if (ts > xMax) xMax = ts;
    const dateObj = new Date(ts);
    // 분만 보여달라고 했으나 동일 분 다수일 때 식별 어려울 수 있어 HH:mm 기본
    const label = `${String(dateObj.getHours()).padStart(2, "0")}:${String(
      dateObj.getMinutes(),
    ).padStart(2, "0")}`; // 필요 시 getMinutes() 만 사용 가능
    // 동일 timestamp 중복 보호
    if (!xLabelMap[ts]) xLabelMap[ts] = label;

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
        value: isNaN(sizeNum) ? 0 : sizeNum, // radius 계산용 (size)
        displayValue: isNaN(valNum as number) ? undefined : valNum, // tooltip 표시에 사용
      } as any; // displayValue 추가 때문에 any
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
  const create = (id: string, d: StripPlotPoint[]) =>
    stripPlot(id, d, {
      categories,
      min: axisMin,
      max: axisMax,
      strictMinMax: true,
      // value(반경) 대신 *_value 값(displayValue) 출력
      tooltipText: "{category}: {displayValue}",
      showScrollbars: true,
      minRadius: 3,
      maxRadius: 10,
      xLabelMap,
    });

  return (
    <>
      <Chart createChart={create} id="strip-plot" data={TableData} />
    </>
  );
}
