import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { PlusIcon } from '../components/Icons';

const WelcomeScreen: React.FC = () => {
    const { users, login, startRegistration } = useAppContext();

    return (
        <div className="max-w-md mx-auto h-screen bg-background dark:bg-dark-background font-sans flex flex-col justify-center items-center p-8 text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">Welcome Back!</h1>
            <p className="text-lg text-text-light dark:text-dark-text-light mb-12">Who is logging in today?</p>
            
            <div className="w-full grid grid-cols-2 gap-6 mb-12">
                {users.map(profile => (
                    <button 
                        key={profile.id}
                        onClick={() => login(profile.id)}
                        className="flex flex-col items-center p-4 bg-card dark:bg-dark-card rounded-2xl shadow-md transition-transform hover:scale-105"
                    >
                        <div className="w-24 h-24 bg-secondary/10 dark:bg-secondary/20 rounded-full flex items-center justify-center mb-4 text-5xl">
                            {profile.avatar}
                        </div>
                        <span className="font-bold text-lg text-text-main dark:text-dark-text-main">{profile.name}</span>
                    </button>
                ))}
                <button 
                    onClick={startRegistration}
                    className="flex flex-col items-center justify-center p-4 bg-card dark:bg-dark-card rounded-2xl shadow-md transition-transform hover:scale-105 border-2 border-dashed border-gray-300 dark:border-dark-border"
                >
                    <div className="w-24 h-24 bg-light-gray dark:bg-dark-border rounded-full flex items-center justify-center mb-4 text-primary">
                        <PlusIcon className="w-12 h-12" />
                    </div>
                    <span className="font-bold text-lg text-text-main dark:text-dark-text-main">Add Profile</span>
                </button>
            </div>
        </div>
    );
};

export default WelcomeScreen;