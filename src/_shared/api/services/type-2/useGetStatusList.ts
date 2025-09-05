import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { api } from "@/_shared/api";

export interface Data {
  [key: string]: string;
}

const getStatusList = async (): Promise<Data[]> => {
  const res = await api.get(`/chart/selectDatasetList.do`);

  return res.data.subjects;
};

const useGetStatusList = (): UseQueryResult<Data[], Error> => {
  return useQuery<Data[], Error>({
    queryKey: ["selectDatasetList"],
    queryFn: () => getStatusList(),
  });
};

export default useGetStatusList;
