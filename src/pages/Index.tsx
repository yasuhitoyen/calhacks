
import React, { useState } from 'react';
import HomePage from '../components/HomePage';
import PreferencesSetup, { UserPreferences } from '../components/PreferencesSetup';
import MainApp from '../components/MainApp';

type AppState = 'home' | 'preferences' | 'app';

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  const handleGetStarted = () => {
    setCurrentState('preferences');
  };

  const handlePreferencesComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    setCurrentState('app');
  };

  const handleBackToHome = () => {
    setCurrentState('home');
  };

  const handleUpdatePreferences = () => {
    setCurrentState('preferences');
  };

  return (
    <div className="w-full">
      {currentState === 'home' && (
        <HomePage onGetStarted={handleGetStarted} />
      )}
      
      {currentState === 'preferences' && (
        <PreferencesSetup 
          onComplete={handlePreferencesComplete}
          onBack={handleBackToHome}
        />
      )}
      
      {currentState === 'app' && userPreferences && (
        <MainApp 
          preferences={userPreferences}
          onUpdatePreferences={handleUpdatePreferences}
        />
      )}
    </div>
  );
};

export default Index;
