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

const getDataList = async (): Promise<Data[]> => {
  const res = await api.get(`/chart/selectMDList.do`);

  return res.data.subjects;
};

const useGetDataList = (): UseQueryResult<Data[], Error> => {
  return useQuery<Data[], Error>({
    queryKey: ["dataList"],
    queryFn: () => getDataList(),
  });
};

export default useGetDataList;
