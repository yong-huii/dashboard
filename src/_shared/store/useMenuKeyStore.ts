import { create } from "zustand";

interface state {
  menuKey: string;

  setMenuKey: (menuKey: string) => void;

  reset: () => void;
}

const useMenuKeyStore = create<state>(set => ({
  menuKey: "/type-1",

  setMenuKey: menuKey => set({ menuKey }),

  reset: () => set({ menuKey: "/type-1" }),
}));

export default useMenuKeyStore;
