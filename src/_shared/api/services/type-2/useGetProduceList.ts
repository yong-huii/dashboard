import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { api } from "@/_shared/api";

export interface Data {
  name: string;
  total_count: string;
  error_cnt: string;
  date: string;
}

const getProduceList = async (date: string): Promise<Data[]> => {
  const res = await api.get(`/chart/selectDayCnt.do?Date=${date}`);

  return res.data.subjects;
};

const useGetProduceList = (date: string): UseQueryResult<Data[], Error> => {
  return useQuery<Data[], Error>({
    queryKey: ["selectDayCnt", date],
    queryFn: () => getProduceList(date),
  });
};

export default useGetProduceList;
