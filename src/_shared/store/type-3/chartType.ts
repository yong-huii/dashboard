import { create } from "zustand";

interface state {
  chartType: string;

  setChartType: (chartType: string) => void;

  reset: () => void;
}

const useChartTypeStore = create<state>(set => ({
  chartType: "WordCloud",

  setChartType: (chartType: string) => set({ chartType }),

  reset: () => set({ chartType: "" }),
}));

export default useChartTypeStore;
