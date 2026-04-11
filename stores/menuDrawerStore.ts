import { create } from 'zustand';

interface MenuDrawerState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useMenuDrawerStore = create<MenuDrawerState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
