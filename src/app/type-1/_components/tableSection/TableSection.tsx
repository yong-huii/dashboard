"use client";

import { useEffect, useRef } from "react";

import useGetDataList from "@/_shared/api/services/type-1/useGetDataList";
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
  const tableSectionRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch } = useGetDataList();
  const { setDataCd } = useDataCdStore();

  useEffect(() => {
    if (data && data.length > 0) {
      setDataCd(data[0].dataCd);
    }
  }, [data, setDataCd]);

  return (
    <div
      className="col-span-11 row-span-2 grid gap-4 lg:col-span-2 lg:row-span-8 lg:grid-rows-[minmax(0,1fr)_minmax(282px,auto)]"
      ref={tableSectionRef}
      style={{ fontSize: 12 }}
    >
      <DataTable
        data={data || []}
        setDataCd={setDataCd}
        tableSectionRef={tableSectionRef}
        isLoading={isLoading}
        refetch={refetch}
      />
      <DataInfoTable data={data || []} isLoading={isLoading} />
    </div>
  );
}
