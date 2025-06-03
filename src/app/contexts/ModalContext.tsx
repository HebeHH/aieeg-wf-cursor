'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ModalItem {
  id: string;
  type: 'speaker' | 'session';
  entityId: string;
  zIndex: number;
}

interface ModalContextType {
  modals: ModalItem[];
  openModal: (type: 'speaker' | 'session', entityId: string) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  getModalPosition: (modalId: string) => { left: string; right: string; top: string } | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalItem[]>([]);

  const openModal = (type: 'speaker' | 'session', entityId: string) => {
    // Check if this modal is already open
    const existingModal = modals.find(m => m.type === type && m.entityId === entityId);
    if (existingModal) {
      return; // Don't open duplicate modals
    }

    const modalId = `${type}-${entityId}-${Date.now()}`;
    const newModal: ModalItem = {
      id: modalId,
      type,
      entityId,
      zIndex: 50 + modals.length,
    };
    
    setModals(prev => [...prev, newModal]);
  };

  const closeModal = (modalId: string) => {
    setModals(prev => prev.filter(modal => modal.id !== modalId));
  };

  const closeAllModals = () => {
    setModals([]);
  };

  const getModalPosition = (modalId: string): { left: string; right: string; top: string } | null => {
    const modal = modals.find(m => m.id === modalId);
    if (!modal) return null;

    const speakerModals = modals.filter(m => m.type === 'speaker');
    const sessionModals = modals.filter(m => m.type === 'session');
    
    if (modal.type === 'session') {
      // Session modals go on the left
      const sessionIndex = sessionModals.indexOf(modal);
      const offsetX = sessionIndex * 30; // Stack with 30px offset
      const offsetY = sessionIndex * 20; // Stack with 20px vertical offset
      return { 
        left: `${60 + offsetX}px`, 
        right: `${50}%`,
        top: `${50 + offsetY}px`
      };
    } else {
      // Speaker modals go on the right
      const speakerIndex = speakerModals.indexOf(modal);
      const offsetX = speakerIndex * 30; // Stack with 30px offset
      const offsetY = speakerIndex * 20; // Stack with 20px vertical offset
      return { 
        left: `${50}%`, 
        right: `${60 + offsetX}px`,
        top: `${50 + offsetY}px`
      };
    }
  };

  return (
    <ModalContext.Provider
      value={{
        modals,
        openModal,
        closeModal,
        closeAllModals,
        getModalPosition,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
} 