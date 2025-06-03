'use client';

import { useModal } from '../contexts/ModalContext';
import SpeakerModal from './SpeakerModal';
import SessionModal from './SessionModal';

export default function ModalManager() {
  const { modals, closeModal, closeAllModals } = useModal();

  if (modals.length === 0) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeAllModals();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-transparent"
      style={{ zIndex: 40, backdropFilter: 'blur(2px)' }}
      onClick={handleBackdropClick}
    >
      {/* Modals are absolutely positioned, so just render them here */}
      {modals.map(modal =>
        modal.type === 'speaker' ? (
          <SpeakerModal
            key={modal.id}
            modalId={modal.id}
            speakerId={modal.entityId}
            onClose={() => closeModal(modal.id)}
          />
        ) : (
          <SessionModal
            key={modal.id}
            modalId={modal.id}
            sessionId={modal.entityId}
            onClose={() => closeModal(modal.id)}
          />
        )
      )}
    </div>
  );
} 