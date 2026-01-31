import { useStore } from '../stores';

// Project hooks
export const useProjectsList = () => useStore((state) => state.projects);
export const useActiveProjectData = () => useStore((state) => state.projects.find((p) => p.id === state.activeProjectId) || null);
export const useSetActiveProject = () => useStore((state) => state.setActiveProjectId);
export const useLoadProjectDetails = () => useStore((state) => state.loadProjectDetails);
export const useCreateProject = () => useStore((state) => state.createProject);
export const useLoadProjects = () => useStore((state) => state.loadProjects);

// Epic hooks
export const useEpics = () => useStore((state) => state.getActiveProject()?.epics || []);
export const useCreateEpic = () => useStore((state) => state.createEpic);

// Ticket hooks
export const useTickets = () => useStore((state) => state.getActiveProject()?.tickets || []);
export const useCreateTicket = () => useStore((state) => state.createTicket);
export const useSaveTicket = () => useStore((state) => state.saveTicket);
export const useDeleteTicket = () => useStore((state) => state.deleteTicket);
export const useMoveTicketToBoard = () => useStore((state) => state.moveTicketToBoard);

// Column hooks
export const useColumns = () => useStore((state) => state.getActiveProject()?.columns || []);
export const useCreateColumn = () => useStore((state) => state.createColumn);
export const useUpdateColumn = () => useStore((state) => state.updateColumn);
export const useDeleteColumn = () => useStore((state) => state.deleteColumn);

// UI hooks
export const useViewModeState = () => useStore((state) => state.viewMode);
export const useSetViewMode = () => useStore((state) => state.setViewMode);
export const useIsAppLoading = () => useStore((state) => state.isLoading);

// Modal hooks - return individual values to avoid object creation
export const useIsTicketModalOpen = () => useStore((state) => state.modal.ticket.isOpen);
export const useTicketModalId = () => useStore((state) => state.modal.ticket.ticketId);
export const useDraftTicket = () => useStore((state) => state.modal.ticket.draftTicket);
export const useTicketModalState = () => useStore((state) => ({
  isOpen: state.modal.ticket.isOpen,
  ticketId: state.modal.ticket.ticketId,
  draftTicket: state.modal.ticket.draftTicket,
}));

export const useOpenTicketModal = () => useStore((state) => state.openTicketModal);
export const useCloseTicketModal = () => useStore((state) => state.closeTicketModal);
export const useUpdateDraftTicket = () => useStore((state) => state.updateDraftTicket);
export const useResetDraftTicket = () => useStore((state) => state.resetDraftTicket);

export const useIsMotherModalOpen = () => useStore((state) => state.modal.mother.isOpen);
export const useMotherModalContent = () => useStore((state) => state.modal.mother.content);
export const useMotherModalTitle = () => useStore((state) => state.modal.mother.title);
export const useIsMotherLoading = () => useStore((state) => state.modal.mother.isLoading);
export const useMotherModalState = () => useStore((state) => ({
  isOpen: state.modal.mother.isOpen,
  content: state.modal.mother.content,
  title: state.modal.mother.title,
  isLoading: state.modal.mother.isLoading,
}));

export const useOpenMotherModal = () => useStore((state) => state.openMotherModal);
export const useCloseMotherModal = () => useStore((state) => state.closeMotherModal);
export const useSetMotherModalLoading = () => useStore((state) => state.setMotherModalLoading);
export const useSetMotherModalContent = () => useStore((state) => state.setMotherModalContent);

// Drag hooks
export const useDraggedTicketId = () => useStore((state) => state.drag.draggedTicketId);
export const useSetDraggedTicketId = () => useStore((state) => state.setDraggedTicketId);

// Status update hook
export const useUpdateTicketStatus = () => useStore((state) => state.updateTicketStatus);
