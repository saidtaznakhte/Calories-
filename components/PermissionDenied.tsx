import React from 'react';
import { CameraIcon, LockIcon, RefreshIcon } from './Icons';

interface PermissionDeniedProps {
  onGoBack: () => void;
  featureName: string;
}

const InstructionStep: React.FC<{ icon: React.ReactNode; text: string; }> = ({ icon, text }) => (
    <div className="flex items-start text-left text-sm">
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-3">{icon}</div>
        <span className="flex-1">{text}</span>
    </div>
);

const PermissionDenied: React.FC<PermissionDeniedProps> = ({ onGoBack, featureName }) => {
  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-900 z-40 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="w-24 h-24 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-6">
        <CameraIcon className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-text-main dark:text-gray-100 mb-2">Camera Access Is Off</h2>
      <p className="text-text-light dark:text-gray-400 mb-8 max-w-sm">
        To use {featureName}, you need to grant camera access in your browser's settings.
      </p>
      
      <div className="bg-light-gray dark:bg-dark-border rounded-xl p-4 text-text-main dark:text-dark-text-light w-full max-w-xs space-y-3 mb-8">
          <InstructionStep icon={<LockIcon className="w-5 h-5"/>} text="Click the lock icon in your browser's address bar." />
          <InstructionStep icon={<CameraIcon className="w-5 h-5"/>} text="Find 'Camera' and switch it to 'Allow'." />
          <InstructionStep icon={<RefreshIcon className="w-5 h-5"/>} text="You may need to reload the page." />
      </div>

      <button
        onClick={onGoBack}
        className="w-full max-w-xs bg-primary text-white font-bold py-3 px-6 rounded-xl text-lg transition-transform hover:scale-105"
      >
        Go Back
      </button>
    </div>
  );
};

export default PermissionDenied;