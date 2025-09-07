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

  // ================== Mock Data (API 미응답 시) ==================
  // 실제 API 필드 패턴: DTM(타임스탬프), <code>_size, <code>_value
  const mockStripPlotRows = useMemo(
    () => [
      {
        DTM: "2025-09-07 09:30:00",
        temp_size: 5,
        temp_value: 68,
        pressure_size: 7,
        pressure_value: 102,
        vibration_size: 2,
        vibration_value: 12,
        defect_size: 1,
        defect_value: 0,
        humidity_size: 4,
        humidity_value: 55,
        flow_size: 3,
        flow_value: 120,
        voltage_size: 5,
        voltage_value: 220,
        current_size: 4,
        current_value: 18,
        speed_size: 3,
        speed_value: 1450,
        torque_size: 4,
        torque_value: 35,
        load_size: 5,
        load_value: 62,
        energy_size: 3,
        energy_value: 210,
      },
      {
        DTM: "2025-09-07 09:31:15",
        temp_size: 6,
        temp_value: 70,
        pressure_size: 5,
        pressure_value: 99,
        vibration_size: 3,
        vibration_value: 15,
        defect_size: 2,
        defect_value: 1,
        humidity_size: 5,
        humidity_value: 56,
        flow_size: 4,
        flow_value: 118,
        voltage_size: 5,
        voltage_value: 221,
        current_size: 5,
        current_value: 19,
        speed_size: 4,
        speed_value: 1460,
        torque_size: 4,
        torque_value: 36,
        load_size: 4,
        load_value: 60,
        energy_size: 3,
        energy_value: 212,
      },
      {
        DTM: "2025-09-07 09:32:40",
        temp_size: 4,
        temp_value: 67,
        pressure_size: 6,
        pressure_value: 101,
        vibration_size: 5,
        vibration_value: 18,
        defect_size: 1,
        defect_value: 0,
        humidity_size: 4,
        humidity_value: 54,
        flow_size: 3,
        flow_value: 119,
        voltage_size: 6,
        voltage_value: 222,
        current_size: 4,
        current_value: 17,
        speed_size: 3,
        speed_value: 1440,
        torque_size: 3,
        torque_value: 34,
        load_size: 4,
        load_value: 61,
        energy_size: 2,
        energy_value: 208,
      },
      {
        DTM: "2025-09-07 09:34:05",
        temp_size: 7,
        temp_value: 72,
        pressure_size: 8,
        pressure_value: 104,
        vibration_size: 4,
        vibration_value: 16,
        defect_size: 3,
        defect_value: 2,
        humidity_size: 6,
        humidity_value: 57,
        flow_size: 5,
        flow_value: 121,
        voltage_size: 6,
        voltage_value: 223,
        current_size: 5,
        current_value: 20,
        speed_size: 4,
        speed_value: 1475,
        torque_size: 5,
        torque_value: 37,
        load_size: 5,
        load_value: 63,
        energy_size: 4,
        energy_value: 215,
      },
      {
        DTM: "2025-09-07 09:35:20",
        temp_size: 6,
        temp_value: 71,
        pressure_size: 7,
        pressure_value: 103,
        vibration_size: 3,
        vibration_value: 14,
        defect_size: 1,
        defect_value: 0,
        humidity_size: 5,
        humidity_value: 55,
        flow_size: 4,
        flow_value: 122,
        voltage_size: 5,
        voltage_value: 221,
        current_size: 4,
        current_value: 18,
        speed_size: 3,
        speed_value: 1455,
        torque_size: 4,
        torque_value: 35,
        load_size: 4,
        load_value: 60,
        energy_size: 3,
        energy_value: 211,
      },
      {
        DTM: "2025-09-07 09:36:45",
        temp_size: 5,
        temp_value: 69,
        pressure_size: 6,
        pressure_value: 100,
        vibration_size: 4,
        vibration_value: 17,
        defect_size: 2,
        defect_value: 1,
        humidity_size: 5,
        humidity_value: 56,
        flow_size: 4,
        flow_value: 119,
        voltage_size: 5,
        voltage_value: 222,
        current_size: 4,
        current_value: 19,
        speed_size: 3,
        speed_value: 1465,
        torque_size: 4,
        torque_value: 36,
        load_size: 4,
        load_value: 59,
        energy_size: 3,
        energy_value: 209,
      },
      {
        DTM: "2025-09-07 09:38:10",
        temp_size: 7,
        temp_value: 73,
        pressure_size: 9,
        pressure_value: 106,
        vibration_size: 2,
        vibration_value: 13,
        defect_size: 1,
        defect_value: 0,
        humidity_size: 6,
        humidity_value: 58,
        flow_size: 5,
        flow_value: 123,
        voltage_size: 6,
        voltage_value: 224,
        current_size: 5,
        current_value: 21,
        speed_size: 4,
        speed_value: 1480,
        torque_size: 5,
        torque_value: 38,
        load_size: 5,
        load_value: 64,
        energy_size: 4,
        energy_value: 217,
      },
      {
        DTM: "2025-09-07 09:39:30",
        temp_size: 8,
        temp_value: 74,
        pressure_size: 8,
        pressure_value: 105,
        vibration_size: 5,
        vibration_value: 19,
        defect_size: 2,
        defect_value: 1,
        humidity_size: 6,
        humidity_value: 57,
        flow_size: 5,
        flow_value: 124,
        voltage_size: 7,
        voltage_value: 225,
        current_size: 6,
        current_value: 22,
        speed_size: 5,
        speed_value: 1490,
        torque_size: 5,
        torque_value: 37,
        load_size: 6,
        load_value: 65,
        energy_size: 4,
        energy_value: 218,
      },
      {
        DTM: "2025-09-07 09:40:55",
        temp_size: 6,
        temp_value: 72,
        pressure_size: 7,
        pressure_value: 102,
        vibration_size: 4,
        vibration_value: 16,
        defect_size: 3,
        defect_value: 2,
        humidity_size: 5,
        humidity_value: 55,
        flow_size: 4,
        flow_value: 121,
        voltage_size: 6,
        voltage_value: 223,
        current_size: 5,
        current_value: 20,
        speed_size: 4,
        speed_value: 1470,
        torque_size: 4,
        torque_value: 36,
        load_size: 5,
        load_value: 63,
        energy_size: 3,
        energy_value: 214,
      },
      {
        DTM: "2025-09-07 09:42:15",
        temp_size: 5,
        temp_value: 70,
        pressure_size: 6,
        pressure_value: 101,
        vibration_size: 3,
        vibration_value: 15,
        defect_size: 1,
        defect_value: 0,
        humidity_size: 4,
        humidity_value: 54,
        flow_size: 3,
        flow_value: 119,
        voltage_size: 5,
        voltage_value: 221,
        current_size: 4,
        current_value: 18,
        speed_size: 3,
        speed_value: 1445,
        torque_size: 3,
        torque_value: 34,
        load_size: 4,
        load_value: 60,
        energy_size: 2,
        energy_value: 207,
      },
      {
        DTM: "2025-09-07 09:43:40",
        temp_size: 7,
        temp_value: 73,
        pressure_size: 9,
        pressure_value: 107,
        vibration_size: 6,
        vibration_value: 21,
        defect_size: 2,
        defect_value: 1,
        humidity_size: 6,
        humidity_value: 58,
        flow_size: 5,
        flow_value: 125,
        voltage_size: 7,
        voltage_value: 226,
        current_size: 6,
        current_value: 23,
        speed_size: 5,
        speed_value: 1500,
        torque_size: 6,
        torque_value: 39,
        load_size: 6,
        load_value: 66,
        energy_size: 5,
        energy_value: 220,
      },
      {
        DTM: "2025-09-07 09:45:05",
        temp_size: 6,
        temp_value: 71,
        pressure_size: 7,
        pressure_value: 103,
        vibration_size: 4,
        vibration_value: 17,
        defect_size: 1,
        defect_value: 0,
        humidity_size: 5,
        humidity_value: 56,
        flow_size: 4,
        flow_value: 122,
        voltage_size: 6,
        voltage_value: 224,
        current_size: 5,
        current_value: 21,
        speed_size: 4,
        speed_value: 1485,
        torque_size: 5,
        torque_value: 38,
        load_size: 5,
        load_value: 64,
        energy_size: 4,
        energy_value: 216,
      },
    ],
    [],
  );

  const sourceRows =
    data && data.length > 0 ? data : (mockStripPlotRows as any[]);

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
  // ---------------------------------------------------------------------

  // 데이터 키에서 *_size 패턴을 추출하여 동적 카테고리 생성
  const categories: StripPlotCategoryMeta[] = useMemo(() => {
    if (!sourceRows || !sourceRows.length) return [];
    const palette = [
      0x67b7dc, 0x6794dc, 0x6771dc, 0x8067dc, 0xa367dc, 0xc767dc, 0xdc67ce,
      0xdc67c0, 0xdc67a4, 0xdc6788, 0xdc676c, 0xdc6750, 0xdc6734, 0xdc6718,
    ];
    const codesSet = new Set<string>();
    // 모든 row 순회 (첫 row만 쓰고 싶으면 data[0]으로 축소 가능)
    for (const row of sourceRows) {
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
  }, [sourceRows]);

  // DTM을 실제 X축 값으로 사용 (timestamp ms)
  // value(버블 크기)는 *_size 사용
  // xLabelMap 으로 각 timestamp -> 'HH:mm' (또는 'mm') 라벨 제공
  let xMin = Number.POSITIVE_INFINITY;
  let xMax = Number.NEGATIVE_INFINITY;
  const xLabelMap: Record<number, string> = {};

  const TableData: StripPlotPoint[] | undefined = sourceRows?.flatMap(
    (row: any) => {
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
      // 툴팁 1줄째: 전체 날짜/시간 (YYYY-MM-DD HH:mm)
      const dtLabel = `${dateObj.getFullYear()}-${String(
        dateObj.getMonth() + 1,
      ).padStart(
        2,
        "0",
      )}-${String(dateObj.getDate()).padStart(2, "0")} ${String(
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
          value: isNaN(sizeNum) ? 0 : sizeNum, // radius 계산용 (size)
          displayValue: isNaN(valNum as number) ? undefined : valNum, // tooltip 표시에 사용
          dtLabel, // 툴팁 첫 줄 날짜/시간
        } as any; // displayValue 추가 때문에 any
      });
    },
  );

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
    {
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
