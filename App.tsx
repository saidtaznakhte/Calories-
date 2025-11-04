
import React from 'react';
import { Page } from './types';
import { AppProvider, useAppContext } from './contexts/AppContext';
import BottomNav from './components/BottomNav';
import DashboardScreen from './screens/DashboardScreen';
import LogMealScreen from './screens/LogMealScreen';
import SettingsScreen from './screens/SettingsScreen';
import CameraScreen from './screens/CameraScreen';
import DiaryScreen from './screens/DiaryScreen';
import ReportsScreen from './screens/ReportsScreen';
import AdjustMacrosScreen from './screens/AdjustMacrosScreen';
import WeightGoalsScreen from './screens/WeightGoalsScreen';
import WeightHistoryScreen from './screens/WeightHistoryScreen';
import WaterHistoryScreen from './screens/WaterHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen';
import LogActivityScreen from './screens/LogActivityScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ManualLogScreen from './screens/ManualLogScreen';
import MealPrepCreatorScreen from './screens/MealPrepCreatorScreen';
import MealDetailScreen from './screens/MealDetailScreen';
import RemindersModal from './components/RemindersModal';

const MainApp: React.FC = () => {
  const { page, isRemindersModalOpen, currentUser, closeRemindersModal, handleRemindersUpdate } = useAppContext();

  const renderPage = () => {
    switch (page) {
      case Page.Dashboard:
        return <DashboardScreen />;
      case Page.Diary:
        return <DiaryScreen />;
      case Page.Reports:
        return <ReportsScreen />;
      case Page.Settings:
        return <SettingsScreen />;
      case Page.LogMeal:
        return <LogMealScreen />;
      case Page.Camera:
        return <CameraScreen />;
      case Page.BarcodeScanner:
        return <BarcodeScannerScreen />;
      case Page.AdjustMacros:
        return <AdjustMacrosScreen />;
      case Page.WeightGoals:
        return <WeightGoalsScreen />;
      case Page.WeightHistory:
        return <WeightHistoryScreen />;
      case Page.WaterHistory:
        return <WaterHistoryScreen />;
      case Page.Profile:
        return <ProfileScreen />;
      case Page.LogActivity:
        return <LogActivityScreen />;
      case Page.ManualLog:
        return <ManualLogScreen />;
      case Page.MealPrepCreator:
        return <MealPrepCreatorScreen />;
      case Page.MealDetail:
        return <MealDetailScreen />;
      default:
        return <DashboardScreen />;
    }
  };
  
  const isBottomNavVisible = [Page.Dashboard, Page.Diary, Page.Reports, Page.Settings].includes(page);

  return (
    <div className="max-w-md mx-auto h-screen bg-background dark:bg-dark-background font-sans flex flex-col shadow-2xl">
       {isRemindersModalOpen && currentUser && (
          <RemindersModal
              isOpen={isRemindersModalOpen}
              onClose={closeRemindersModal}
              reminders={currentUser.reminders}
              onSave={handleRemindersUpdate}
          />
      )}
      <main className={`flex-1 overflow-y-auto ${isBottomNavVisible ? 'pb-20' : ''}`}>
        <div key={page} className="animate-fade-in">
          {renderPage()}
        </div>
      </main>
      {isBottomNavVisible && <BottomNav />}
    </div>
  );
};

const AuthFlow: React.FC = () => {
  const { currentUser, users, isRegistering } = useAppContext();

  if (currentUser) {
    return <MainApp />;
  }
  
  if (isRegistering || users.length === 0) {
    return <OnboardingScreen />;
  }

  return <WelcomeScreen />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AuthFlow />
    </AppProvider>
  );
};

export default App;
