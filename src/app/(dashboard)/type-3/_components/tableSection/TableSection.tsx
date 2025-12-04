"use client";

import { useEffect, useRef } from "react";

import useGetReportData from "@/_shared/api/services/type-3/useReportData";
import { useIsPad } from "@/_shared/hooks/useIsDevice";
import useDataCdStore from "@/_shared/store/type-1/dataCd";

import DataTable from "./DataTable";

export interface DataType {
  dataCd: string;
  srcDataNm: string;

  anlMdl: string;
  oputFile: string;
  lnCnt: string;
  dataSize: string;
  vbgRgnId: string;
  vbgRgstTismp: string;
}

export default function TableSection() {
  const isPad = useIsPad();

  const { data, isLoading, refetch } = useGetReportData();
  const { setDataCd, dataCd } = useDataCdStore();

  const initializedRef = useRef(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (initializedRef.current) return;
    if (data && data.length > 0) {
      const first = data[0].dataCd;
      setDataCd(first);
      initializedRef.current = true;
    }
  }, [data, setDataCd]);

  // 10초마다 다음 데이터로 자동 선택
  useEffect(() => {
    if (!data || data.length === 0) return;

    // 현재 선택된 dataCd와 동기화
    const currentIndex = data.findIndex(d => d.dataCd === dataCd);
    indexRef.current = currentIndex >= 0 ? currentIndex : 0;

    const timer = setInterval(() => {
      if (!data || data.length === 0) return;
      indexRef.current = (indexRef.current + 1) % data.length;
      setDataCd(data[indexRef.current].dataCd);
    }, 30000);

    return () => clearInterval(timer);
  }, [data, dataCd, setDataCd]);

  return (
    <div
      className={`col-span-11 row-span-2 grid gap-4 lg:row-span-8 ${isPad ? "lg:col-span-3" : "lg:col-span-2"}`}
      style={{ fontSize: 12 }}
    >
      <DataTable data={data || []} isLoading={isLoading} refetch={refetch} />
    </div>
  );
}
