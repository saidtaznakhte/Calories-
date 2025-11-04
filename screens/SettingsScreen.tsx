
import React from 'react';
import { Page, ThemePreference } from '../types';
import { ChevronRightIcon, MoonIcon, SunIcon, DesktopIcon } from '../components/Icons';
import { useAppContext } from '../contexts/AppContext';

const SettingsListItem: React.FC<{
  icon: string;
  text: string;
  onClick: () => void;
  isDestructive?: boolean;
}> = ({ icon, text, onClick, isDestructive }) => {
  return (
    <button onClick={onClick} className="w-full flex items-center py-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-lg ${isDestructive ? 'bg-red-100 dark:bg-red-500/20' : 'bg-light-gray dark:bg-dark-border'}`}>
        {icon}
      </div>
      <span className={`flex-1 text-left font-semibold ${isDestructive ? 'text-red-500' : 'text-text-main dark:text-dark-text-main'}`}>
        {text}
      </span>
      {!isDestructive && <ChevronRightIcon className="w-5 h-5 text-medium-gray" />}
    </button>
  );
};

const ThemeToggleButton: React.FC<{
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-colors ${isActive ? 'bg-primary-light dark:bg-primary/20' : 'hover:bg-light-gray dark:hover:bg-dark-border'}`}>
        <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-primary' : 'text-text-light dark:text-dark-text-light'}`} />
        <span className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-text-main dark:text-dark-text-main'}`}>{label}</span>
    </button>
);


const SettingsScreen: React.FC = () => {
  const { navigateTo, profile, logout, deleteCurrentUser, themePreference, handleThemePreferenceChange, openRemindersModal } = useAppContext();

  return (
    <div className="p-4 bg-background dark:bg-dark-background min-h-full">
      <header className="py-4">
        <h1 className="text-3xl font-bold text-text-main dark:text-dark-text-main">Settings</h1>
      </header>

      <div className="space-y-6 mt-4">
        <div className="bg-card dark:bg-dark-card rounded-2xl p-4 flex items-center shadow-sm">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mr-4 text-3xl">
            {profile.avatar}
          </div>
          <div>
            <p className="font-bold text-lg text-text-main dark:text-dark-text-main">{profile.name}</p>
            <p className="text-sm text-text-light dark:text-dark-text-light">Your personal wellness hub</p>
          </div>
        </div>

        <div className="bg-card dark:bg-dark-card rounded-2xl px-4 divide-y divide-light-gray dark:divide-dark-border shadow-sm">
          <h3 className="text-lg font-bold text-text-main dark:text-dark-text-main pt-4 px-1">Account</h3>
          <SettingsListItem icon="👤" text="Profile" onClick={() => navigateTo(Page.Profile)} />
          <SettingsListItem icon="⚖️" text="Weight & Goals" onClick={() => navigateTo(Page.WeightGoals)} />
          <SettingsListItem icon="📊" text="Macronutrients" onClick={() => navigateTo(Page.AdjustMacros)} />
        </div>
      
        <div className="bg-card dark:bg-dark-card rounded-2xl px-4 divide-y divide-light-gray dark:divide-dark-border shadow-sm">
          <h3 className="text-lg font-bold text-text-main dark:text-dark-text-main pt-4 px-1">History</h3>
          <SettingsListItem icon="📜" text="Weight History" onClick={() => navigateTo(Page.WeightHistory)} />
          <SettingsListItem icon="💧" text="Water History" onClick={() => navigateTo(Page.WaterHistory)} />
        </div>

         <div className="bg-card dark:bg-dark-card rounded-2xl px-4 divide-y divide-light-gray dark:divide-dark-border shadow-sm">
          <h3 className="text-lg font-bold text-text-main dark:text-dark-text-main pt-4 px-1">Preferences</h3>
          <SettingsListItem icon="🔔" text="Notifications & Reminders" onClick={openRemindersModal} />
          <div className="py-4">
            <h4 className="font-semibold text-text-main dark:text-dark-text-main mb-3 px-1">Appearance</h4>
            <div className="flex space-x-2 p-1 bg-light-gray dark:bg-dark-border rounded-xl">
                <ThemeToggleButton label="Light" icon={SunIcon} isActive={themePreference === 'light'} onClick={() => handleThemePreferenceChange('light')} />
                <ThemeToggleButton label="Dark" icon={MoonIcon} isActive={themePreference === 'dark'} onClick={() => handleThemePreferenceChange('dark')} />
                <ThemeToggleButton label="System" icon={DesktopIcon} isActive={themePreference === 'system'} onClick={() => handleThemePreferenceChange('system')} />
            </div>
          </div>
        </div>
        
        <div className="bg-card dark:bg-dark-card rounded-2xl px-4 divide-y divide-light-gray dark:divide-dark-border shadow-sm">
            <SettingsListItem icon="➡️" text="Logout" onClick={logout} />
            <SettingsListItem icon="🗑️" text="Delete Account" onClick={deleteCurrentUser} isDestructive />
        </div>

        <p className="text-center text-xs text-medium-gray dark:text-dark-gray pt-4">Cal AI Version 1.0.0</p>
      </div>
    </div>
  );
};

export default SettingsScreen;
