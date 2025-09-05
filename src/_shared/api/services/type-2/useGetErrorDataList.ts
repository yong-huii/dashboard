import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { api } from "@/_shared/api";

export interface Data {
  [key: string]: string;
}

const getErrorDataList = async (
  dataSet: string,
  asset: string,
): Promise<Data[]> => {
  const res = await api.get(
    `/chart/selectLatestHour.do?Dataset=${dataSet}&Asset=${asset}`,
  );

  return res.data.subjects;
};

const useGetErrorDataList = (
  dataSet: string,
  asset: string,
): UseQueryResult<Data[], Error> => {
  return useQuery<Data[], Error>({
    queryKey: ["selectLatestHour", dataSet, asset],
    queryFn: () => getErrorDataList(dataSet, asset),
    enabled: !!dataSet && !!asset,
  });
};

export default useGetErrorDataList;
