import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { api } from "@/_shared/api";

export interface Data {
  dataCd: string;
  srcDataNm: string;

  anlMdl: string;
  oputFile: string;
  lnCnt: string;
  dataSize: string;
  vbgRgnId: string;
  vbgRgstTismp: string;
}
const getReportData = async () => {
  const res = await api.get(`/chart/selectMDListESG.do`);
  if (res.data.status === "error") {
    return [];
  }

  return res.data.subjects;
};

const useGetReportData = (): UseQueryResult<Data[], Error> => {
  return useQuery<Data[], Error>({
    queryKey: ["ReportData"],
    queryFn: getReportData,
  });
};

export default useGetReportData;
