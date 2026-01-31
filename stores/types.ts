import { Ticket, TicketStatus } from '../types';

export type ViewMode = 'BOARD' | 'TIMELINE' | 'BACKLOG';

export interface DraftTicket extends Ticket {
  isDirty: boolean;
}

export interface ModalState {
  mother: {
    isOpen: boolean;
    content: string;
    title: string;
    isLoading: boolean;
  };
  ticket: {
    isOpen: boolean;
    ticketId: string | null;
    draftTicket: DraftTicket | null;
  };
}

export interface DragState {
  draggedTicketId: string | null;
}
