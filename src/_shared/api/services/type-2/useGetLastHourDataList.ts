import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { api } from "@/_shared/api";

export interface Data {
  [key: string]: string;
}

const getLastHourDataList = async (): Promise<Data[]> => {
  const res = await api.get(`/chart/selectLatestHourStatsAll.do`);

  return res.data.subjects;
};

const useGetLastHourDataList = (): UseQueryResult<Data[], Error> => {
  return useQuery<Data[], Error>({
    queryKey: ["selectLatestHourStatsAll"],
    queryFn: () => getLastHourDataList(),
  });
};

export default useGetLastHourDataList;
