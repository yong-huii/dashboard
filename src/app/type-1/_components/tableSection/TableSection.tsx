"use client";

import { useEffect, useMemo, useRef } from "react";

import useGetDataList from "@/_shared/api/services/type-1/useGetDataList";
import { useIsPad } from "@/_shared/hooks/useIsDevice";
import useDataCdStore from "@/_shared/store/type-1/dataCd";

import DataInfoTable from "./DataInfoTable";
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

  const tableSectionRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch } = useGetDataList();
  const { dataCd, setDataCd } = useDataCdStore();

  const mockData: DataType[] = useMemo(
    () => [
      {
        dataCd: "202509070001",
        srcDataNm: "사출기1호",
        anlMdl: "이상탐지 v1",
        oputFile: "2450",
        lnCnt: "187234",
        dataSize: "52340",
        vbgRgnId: "op_user01",
        vbgRgstTismp: "2025-09-07 09:15:23",
      },
      {
        dataCd: "202509070002",
        srcDataNm: "사출기2호",
        anlMdl: "품질예측 v2",
        oputFile: "1980",
        lnCnt: "165221",
        dataSize: "48710",
        vbgRgnId: "op_user02",
        vbgRgstTismp: "2025-09-07 09:15:23",
      },
      {
        dataCd: "202509070003",
        srcDataNm: "사출기3호",
        anlMdl: "온도패턴 v1",
        oputFile: "1530",
        lnCnt: "142890",
        dataSize: "45120",
        vbgRgnId: "op_user03",
        vbgRgstTismp: "2025-09-07 09:15:23",
      },
      {
        dataCd: "202509070004",
        srcDataNm: "사출기4호",
        anlMdl: "에너지최적화 v1",
        oputFile: "1675",
        lnCnt: "158004",
        dataSize: "46288",
        vbgRgnId: "op_user04",
        vbgRgstTismp: "2025-09-07 09:15:23",
      },
    ],
    [],
  );

  const dataset = data && data.length > 0 ? data : mockData;

  useEffect(() => {
    if (dataset && dataset.length > 0) {
      const first = dataset[0].dataCd;
      if (dataCd !== first) {
        setDataCd(first);
      }
    }
  }, [dataset, dataCd, setDataCd]);

  return (
    <div
      className={`col-span-11 row-span-2 grid grid-rows-8 gap-4 lg:row-span-8 ${isPad ? "lg:col-span-3" : "lg:col-span-2"}`}
      ref={tableSectionRef}
      style={{ fontSize: 12 }}
    >
      <DataTable
        data={dataset}
        setDataCd={setDataCd}
        tableSectionRef={tableSectionRef}
        isLoading={isLoading}
        refetch={refetch}
      />
      <DataInfoTable data={dataset} isLoading={isLoading} />
    </div>
  );
}
