import React from "react";
import { create } from "zustand";

interface targetRefState {
  targetRef: React.RefObject<HTMLDivElement | null> | null;
  setTargetRef: (ref: React.RefObject<HTMLDivElement | null>) => void;
}

const useTargetRefStore = create<targetRefState>(set => ({
  targetRef: null,
  setTargetRef: ref => set({ targetRef: ref }),
}));

export default useTargetRefStore;
