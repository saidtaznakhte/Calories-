import React, { useState } from 'react';
import { Page, UserProfile, Gender, ActivityLevel, PrimaryGoal, UnitSystem } from '../types';
import { BackIcon } from '../components/Icons';
import { useAppContext } from '../contexts/AppContext';
import { cmToInches, getDisplayHeightCm, getDisplayHeightFt, getDisplayHeightIn } from '../utils/units';

const avatars = ['🧑‍🦰', '👩‍🦳', '👨‍🚀', '🦸‍♀️', '🧘‍♂️', '🎨', '🎸', '⚽️'];

const UnitSelector: React.FC<{ selected: UnitSystem; onSelect: (system: UnitSystem) => void }> = ({ selected, onSelect }) => (
    <div className="flex p-1 bg-gray-200 dark:bg-dark-border rounded-full">
        <button
            onClick={() => onSelect(UnitSystem.Imperial)}
            className={`w-1/2 py-2 rounded-full font-semibold transition-colors ${selected === UnitSystem.Imperial ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}`}
        >
            Imperial (lbs, ft)
        </button>
        <button
            onClick={() => onSelect(UnitSystem.Metric)}
            className={`w-1/2 py-2 rounded-full font-semibold transition-colors ${selected === UnitSystem.Metric ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}`}
        >
            Metric (kg, cm)
        </button>
    </div>
);


const ProfileScreen: React.FC = () => {
    const { navigateTo, profile: currentProfile, handleProfileUpdate: onSave } = useAppContext();
    const [profile, setProfile] = useState<UserProfile>(currentProfile);

    const handleSave = () => {
        onSave(profile);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: name === 'age' ? parseInt(value) || 0 : value,
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    
    const handleHeightChange = (part: 'feet' | 'inches', value: string) => {
        const numericValue = parseInt(value) || 0;
        const currentFeet = Math.floor(profile.height / 12);
        const currentInches = profile.height % 12;
        let newTotalInches;
        if (part === 'feet') {
            newTotalInches = numericValue * 12 + currentInches;
        } else {
            newTotalInches = currentFeet * 12 + numericValue;
        }
        setProfile(p => ({ ...p, height: newTotalInches }));
    };

    return (
        <div className="p-4 flex flex-col h-full bg-background dark:bg-dark-background">
            <header className="flex items-center mb-6">
                <button onClick={() => navigateTo(Page.Settings)} className="p-2 -ml-2">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto">Edit Profile</h1>
                <div className="w-6"></div>
            </header>

            <div className="flex-1 overflow-y-auto bg-card dark:bg-dark-card rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Avatar</label>
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-4 text-5xl">
                            {profile.avatar}
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {avatars.map(avatar => (
                                <button
                                    key={avatar}
                                    onClick={() => setProfile(p => ({ ...p, avatar }))}
                                    className={`w-12 h-12 rounded-full text-2xl flex items-center justify-center transition-transform hover:scale-110 ${profile.avatar === avatar ? 'bg-primary-light ring-2 ring-primary' : 'bg-light-gray dark:bg-dark-border'}`}
                                >
                                    {avatar}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Name</label>
                    <input id="name" name="name" type="text" value={profile.name} onChange={handleInputChange} className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="age" className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Age</label>
                        <input id="age" name="age" type="number" value={profile.age} onChange={handleInputChange} className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="gender" className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Gender</label>
                        <select id="gender" name="gender" value={profile.gender} onChange={handleSelectChange} className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none">
                            {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>
                
                 <div>
                    <label className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Unit System</label>
                    <UnitSelector selected={profile.unitSystem} onSelect={(system) => setProfile(p => ({ ...p, unitSystem: system }))} />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Height</label>
                    {profile.unitSystem === UnitSystem.Metric ? (
                        <div className="relative">
                            <input type="number" value={getDisplayHeightCm(profile.height)} onChange={e => setProfile(p => ({...p, height: cmToInches(parseInt(e.target.value) || 0)}))} className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none pr-12" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-light">cm</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <input type="number" value={getDisplayHeightFt(profile.height)} onChange={e => handleHeightChange('feet', e.target.value)} className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" placeholder="ft" />
                            <input type="number" value={getDisplayHeightIn(profile.height)} onChange={e => handleHeightChange('inches', e.target.value)} className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" placeholder="in" />
                        </div>
                    )}
                </div>
                
                <div>
                    <label htmlFor="activityLevel" className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Activity Level</label>
                    <select id="activityLevel" name="activityLevel" value={profile.activityLevel} onChange={handleSelectChange} className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none">
                        {Object.values(ActivityLevel).map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="primaryGoal" className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Primary Goal</label>
                    <select id="primaryGoal" name="primaryGoal" value={profile.primaryGoal} onChange={handleSelectChange} className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none">
                        {Object.values(PrimaryGoal).map(goal => <option key={goal} value={goal}>{goal}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-6">
                <button onClick={handleSave} className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-primary/90 transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default ProfileScreen;