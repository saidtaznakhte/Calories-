import React from 'react';
import { CameraIcon } from './Icons';

interface RequestCameraAccessProps {
  onGrant: () => void;
  onDeny: () => void;
  featureName: string;
  featureDescription: string;
}

const RequestCameraAccess: React.FC<RequestCameraAccessProps> = ({ onGrant, onDeny, featureName, featureDescription }) => {
  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-900 z-40 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="w-24 h-24 bg-primary-light dark:bg-primary/20 rounded-full flex items-center justify-center mb-6">
        <CameraIcon className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-text-main dark:text-gray-100 mb-2">Enable Camera for {featureName}</h2>
      <p className="text-text-light dark:text-gray-400 mb-8 max-w-sm">{featureDescription}</p>
      <button
        onClick={onGrant}
        className="w-full max-w-xs bg-primary text-white font-bold py-3 px-6 rounded-xl text-lg transition-transform hover:scale-105 mb-4"
      >
        Continue
      </button>
      <button
        onClick={onDeny}
        className="w-full max-w-xs text-text-light dark:text-gray-400 font-semibold py-3 px-6 rounded-xl text-md"
      >
        Not Now
      </button>
    </div>
  );
};

export default RequestCameraAccess;
