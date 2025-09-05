import dayjs from "dayjs";
import { create } from "zustand";

interface state {
  date: string;

  setDate: (date: string) => void;

  reset: () => void;
}

const useDateStore = create<state>(set => ({
  date: dayjs().format("YYYYMMDD"),

  setDate: date => set({ date }),

  reset: () => set({ date: dayjs().format("YYYYMMDD") }),
}));

export default useDateStore;
