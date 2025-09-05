import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { api } from "@/_shared/api";

export interface Data {
  Word: string;
  Frequency: number;
  Group: string;
}

const getXlsxData = async (seqNo: string): Promise<Data[]> => {
  const res = await api.get(`/chart/selectXlsxData.do?SeqNo=${seqNo}`);
  if (res.data.status === "error") {
    return [];
  }

  return res.data.subjects;
};

const useGetXlsxData = (seqNo: string): UseQueryResult<Data[], Error> => {
  return useQuery<Data[], Error>({
    queryKey: ["xlsxData", seqNo],
    queryFn: () => getXlsxData(seqNo),
    enabled: !!seqNo,
  });
};

export default useGetXlsxData;
