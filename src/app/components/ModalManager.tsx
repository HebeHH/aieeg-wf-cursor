'use client';

import { useModal } from '../contexts/ModalContext';
import SpeakerModal from './SpeakerModal';
import SessionModal from './SessionModal';
import { useEffect, useState } from 'react';

export default function ModalManager() {
  const { modals, closeModal, closeAllModals } = useModal();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      {/* Modals are absolutely positioned on desktop, centered on mobile */}
      {modals.map(modal => {
        const commonProps = {
          key: modal.id,
          modalId: modal.id,
          onClose: () => closeModal(modal.id),
          isMobile,
        };

        return modal.type === 'speaker' ? (
          <SpeakerModal
            {...commonProps}
            speakerId={modal.entityId}
          />
        ) : (
          <SessionModal
            {...commonProps}
            sessionId={modal.entityId}
          />
        );
      })}
    </div>
  );
} 