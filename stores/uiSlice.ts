import { StateCreator } from 'zustand';
import { ModalState, DragState, ViewMode, DraftTicket } from './types';

export interface UISlice {
  // Active project ID (UI state)
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;

  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Modal state
  modal: ModalState;
  openMotherModal: (title: string, content?: string) => void;
  closeMotherModal: () => void;
  setMotherModalLoading: (isLoading: boolean) => void;
  setMotherModalContent: (content: string) => void;
  openTicketModal: (ticketId: string | null, draftTicket?: DraftTicket) => void;
  closeTicketModal: () => void;
  updateDraftTicket: (updates: Partial<DraftTicket>) => void;
  resetDraftTicket: () => void;

  // Drag state
  drag: DragState;
  setDraggedTicketId: (id: string | null) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set, get) => ({
  // Active project ID
  activeProjectId: '',

  // View mode
  viewMode: 'BOARD',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Setter for activeProjectId
  setActiveProjectId: (id) => set({ activeProjectId: id }),

  // Loading
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Modal state
  modal: {
    mother: {
      isOpen: false,
      content: '',
      title: '',
      isLoading: false,
    },
    ticket: {
      isOpen: false,
      ticketId: null,
      draftTicket: null,
    },
  },

  openMotherModal: (title, content = '') =>
    set((state) => ({
      modal: {
        ...state.modal,
        mother: {
          isOpen: true,
          title,
          content,
          isLoading: false,
        },
      },
    })),

  closeMotherModal: () =>
    set((state) => ({
      modal: {
        ...state.modal,
        mother: {
          ...state.modal.mother,
          isOpen: false,
          content: '',
        },
      },
    })),

  setMotherModalLoading: (isLoading) =>
    set((state) => ({
      modal: {
        ...state.modal,
        mother: {
          ...state.modal.mother,
          isLoading,
        },
      },
    })),

  setMotherModalContent: (content) =>
    set((state) => ({
      modal: {
        ...state.modal,
        mother: {
          ...state.modal.mother,
          content,
        },
      },
    })),

  openTicketModal: (ticketId, draftTicket) =>
    set((state) => {
      // If opening a different ticket, reset the draft
      const shouldResetDraft = ticketId !== state.modal.ticket.ticketId;
      return {
        modal: {
          ...state.modal,
          ticket: {
            isOpen: true,
            ticketId,
            draftTicket: shouldResetDraft ? (draftTicket || null) : state.modal.ticket.draftTicket,
          },
        },
      };
    }),

  closeTicketModal: () =>
    set((state) => ({
      modal: {
        ...state.modal,
        ticket: {
          isOpen: false,
          ticketId: null,
          draftTicket: null, // Reset draft when closing
        },
      },
    })),

  updateDraftTicket: (updates) =>
    set((state) => ({
      modal: {
        ...state.modal,
        ticket: {
          ...state.modal.ticket,
          draftTicket: state.modal.ticket.draftTicket
            ? { ...state.modal.ticket.draftTicket, ...updates, isDirty: true }
            : null,
        },
      },
    })),

  resetDraftTicket: () =>
    set((state) => ({
      modal: {
        ...state.modal,
        ticket: {
          ...state.modal.ticket,
          draftTicket: null,
        },
      },
    })),

  // Drag state
  drag: {
    draggedTicketId: null,
  },
  setDraggedTicketId: (id) =>
    set((state) => ({
      drag: {
        ...state.drag,
        draggedTicketId: id,
      },
    })),
});
