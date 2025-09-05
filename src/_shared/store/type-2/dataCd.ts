import { create } from "zustand";

interface state {
  dataCd: string;
  assetCd: string;

  setDataCd: (dataCd: string) => void;
  setAssetCd: (assetCd: string) => void;

  reset: () => void;
}

const useDataCdStore = create<state>(set => ({
  dataCd: "",
  assetCd: "",

  setDataCd: dataCd => set({ dataCd }),
  setAssetCd: assetCd => set({ assetCd }),

  reset: () => set({ dataCd: "", assetCd: "" }),
}));

export default useDataCdStore;
