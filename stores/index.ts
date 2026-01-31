import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createUISlice, UISlice } from './uiSlice';
import { createDataSlice, DataSlice } from './dataSlice';

export type StoreState = UISlice & DataSlice;

export const useStore = create<StoreState>()(
  devtools(
    (set, get, api) => ({
      ...createUISlice(set, get, api),
      ...createDataSlice(set, get, api),
    }),
    { name: 'XenonFlowStore' }
  )
);

// Memoized selector for active project to prevent infinite loops
const activeProjectSelector = (state: StoreState) => {
  const project = state.projects.find((p) => p.id === state.activeProjectId);
  return project || null;
};

// Selector functions for computed values
export const useActiveProject = () => useStore(activeProjectSelector);
export const useProjects = () => useStore((state) => state.projects);
export const useActiveProjectId = () => useStore((state) => state.activeProjectId);
export const useSetActiveProjectId = () => useStore((state) => state.setActiveProjectId);
export const useViewMode = () => useStore((state) => state.viewMode);
export const useModalState = () => useStore((state) => state.modal);
export const useTicketModal = () => useStore((state) => state.modal.ticket);
export const useMotherModal = () => useStore((state) => state.modal.mother);
export const useDragState = () => useStore((state) => state.drag);
export const useIsLoading = () => useStore((state) => state.isLoading);
