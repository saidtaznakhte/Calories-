import React from 'react';

interface InfoModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const InfoModal: React.FC<InfoModalProps> = ({ title, onClose, children }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-11/12 max-w-sm animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="info-modal-title" className="text-xl font-bold text-text-main dark:text-gray-100 mb-4 text-center">{title}</h2>
        <div className="text-text-light dark:text-gray-300 space-y-3 text-center mb-6">
          {children}
        </div>
        <button
          onClick={onClose}
          className="w-full bg-primary text-white font-bold py-3 rounded-xl text-lg"
          aria-label="Close modal"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default InfoModal;
