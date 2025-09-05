import { create } from "zustand";

interface state {
  dataCd: string;

  setDataCd: (dataCd: string) => void;

  reset: () => void;
}

const useDataCdStore = create<state>(set => ({
  dataCd: "",

  setDataCd: dataCd => set({ dataCd }),

  reset: () => set({ dataCd: "" }),
}));

export default useDataCdStore;
