import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { api } from "@/_shared/api";

export interface Data {
  [key: string]: string;
}

const getLastMonthDataList = async (): Promise<Data[]> => {
  const res = await api.get(`/chart/selectLatestMonthCnt.do`);

  return res.data.subjects;
};

const useGetLastMonthDataList = (): UseQueryResult<Data[], Error> => {
  return useQuery<Data[], Error>({
    queryKey: ["selectLatestMonthCnt"],
    queryFn: () => getLastMonthDataList(),
  });
};

export default useGetLastMonthDataList;
