import React from 'react';
import { Page } from '../types';
import { HomeIcon, BookOpenIcon, BarChartIcon, SettingsIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

const NavItem: React.FC<{
  page: Page;
  Icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ page, Icon, label, isActive, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center w-1/4 h-16 transition-colors duration-200 ease-in-out focus:outline-none">
    <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-primary' : 'text-medium-gray dark:text-dark-gray'}`} />
    <span className={`text-xs ${isActive ? 'text-primary' : 'text-medium-gray dark:text-dark-gray'}`}>{label}</span>
  </button>
);

const BottomNav: React.FC = () => {
  const { page: currentPage, navigateTo } = useAppContext();

  const navItems = [
    { page: Page.Dashboard, Icon: HomeIcon, label: 'Dashboard' },
    { page: Page.Diary, Icon: BookOpenIcon, label: 'Diary' },
    { page: Page.Reports, Icon: BarChartIcon, label: 'Reports' },
    { page: Page.Settings, Icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-card dark:bg-dark-card border-t border-light-gray dark:border-dark-border shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] flex justify-around items-center">
      {navItems.map(({ page, Icon, label }) => (
        <NavItem
          key={page}
          page={page}
          Icon={Icon}
          label={label}
          isActive={currentPage === page}
          onClick={() => navigateTo(page)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;
