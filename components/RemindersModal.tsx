import React, { useState, useEffect } from 'react';
import { ReminderSettings, ReminderType } from '../types';
import { BellIcon, ClockIcon } from './Icons';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: ReminderSettings;
  onSave: (newSettings: ReminderSettings) => void;
}

const ReminderRow: React.FC<{
    label: ReminderType;
    icon: string;
    settings: ReminderSettings[ReminderType];
    onChange: (newSettings: Partial<ReminderSettings[ReminderType]>) => void;
    isDisabled: boolean;
}> = ({ label, icon, settings, onChange, isDisabled }) => (
    <div className="flex items-center justify-between py-3">
        <div className="flex items-center">
            <span className="text-2xl mr-4">{icon}</span>
            <span className="font-semibold text-text-main dark:text-dark-text-main">{label}</span>
        </div>
        <div className="flex items-center space-x-3">
            <input 
                type="time" 
                value={settings.time}
                onChange={(e) => onChange({ time: e.target.value })}
                disabled={!settings.enabled || isDisabled}
                className="bg-light-gray dark:bg-dark-border p-2 rounded-md text-sm w-24 disabled:opacity-50"
            />
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={settings.enabled} 
                    onChange={(e) => onChange({ enabled: e.target.checked })} 
                    className="sr-only peer"
                    disabled={isDisabled}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
        </div>
    </div>
);

const RemindersModal: React.FC<RemindersModalProps> = ({ isOpen, onClose, reminders, onSave }) => {
  const [localSettings, setLocalSettings] = useState<ReminderSettings>(reminders);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
        setPermission(Notification.permission);
    }
  }, [isOpen]);
  
  useEffect(() => {
    setLocalSettings(reminders);
  }, [reminders]);

  const handleSettingChange = (type: ReminderType, newSettings: Partial<ReminderSettings[ReminderType]>) => {
    setLocalSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], ...newSettings },
    }));
  };
  
  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined') {
        const result = await Notification.requestPermission();
        setPermission(result);
    }
  };

  if (!isOpen) return null;

  const reminderTypes: { type: ReminderType; icon: string }[] = [
    { type: 'Breakfast', icon: '🥞' },
    { type: 'Lunch', icon: '🥗' },
    { type: 'Dinner', icon: '🍲' },
    { type: 'Snacks', icon: '🍎' },
    { type: 'Water', icon: '💧' },
  ];
  
  const isFormDisabled = permission === 'denied';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-card dark:bg-dark-card rounded-2xl p-6 w-11/12 max-w-md animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center text-center mb-4">
            <ClockIcon className="w-6 h-6 mr-3 text-text-main dark:text-dark-text-main" />
            <h2 className="text-xl font-bold text-text-main dark:text-dark-text-main">Set Reminders</h2>
        </div>
        
        {permission === 'default' && (
            <div className="bg-primary-light dark:bg-primary/20 p-4 rounded-lg text-center mb-4">
                <p className="text-sm text-text-main dark:text-dark-text-main mb-2">Enable notifications to get reminders.</p>
                <button onClick={requestNotificationPermission} className="bg-primary text-white font-semibold px-4 py-2 rounded-md text-sm">Allow Notifications</button>
            </div>
        )}
        
        {permission === 'denied' && (
            <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg text-center mb-4">
                <p className="text-sm text-red-700 dark:text-red-300">Notifications are blocked. You need to enable them in your browser settings to use reminders.</p>
            </div>
        )}
        
        <div className="divide-y divide-light-gray dark:divide-dark-border">
            {reminderTypes.map(({ type, icon }) => (
                 <ReminderRow 
                    key={type}
                    label={type}
                    icon={icon}
                    settings={localSettings[type]}
                    onChange={(newSettings) => handleSettingChange(type, newSettings)}
                    isDisabled={isFormDisabled}
                />
            ))}
        </div>

        <div className="flex gap-4 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main font-semibold">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold" disabled={isFormDisabled}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default RemindersModal;