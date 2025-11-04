import React, { useState, useMemo } from 'react';
import { UserProfile, Gender, ActivityLevel, PrimaryGoal, UnitSystem } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { BackIcon } from '../components/Icons';
import { cmToInches, inchesToCm, kgToLbs, lbsToKg } from '../utils/units';

const avatars = ['🧑‍🦰', '👩‍🦳', '👨‍🚀', '🦸‍♀️', '🧘‍♂️', '🎨', '🎸', '⚽️'];

const ProgressBar: React.FC<{ step: number; totalSteps: number }> = ({ step, totalSteps }) => (
    <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2.5 mb-8">
        <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
    </div>
);

const StepButton: React.FC<{ onClick: () => void; text: string; disabled?: boolean; }> = ({ onClick, text, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-primary/90 transition-colors disabled:bg-gray-400 dark:disabled:bg-dark-gray"
    >
        {text}
    </button>
);

const SelectionCard: React.FC<{ title: string; description: string; isSelected: boolean; onSelect: () => void; }> = ({ title, description, isSelected, onSelect }) => (
     <button onClick={onSelect} className={`w-full p-4 rounded-xl text-left border-2 transition-all ${isSelected ? 'bg-primary-light dark:bg-primary/20 border-primary' : 'bg-card dark:bg-dark-card border-light-gray dark:border-dark-border'}`}>
        <h3 className={`font-bold text-lg ${isSelected ? 'text-primary' : 'text-text-main dark:text-dark-text-main'}`}>{title}</h3>
        <p className="text-sm text-text-light dark:text-dark-text-light">{description}</p>
    </button>
);

const UnitSelector: React.FC<{ selected: UnitSystem; onSelect: (system: UnitSystem) => void }> = ({ selected, onSelect }) => (
    <div className="flex p-1 bg-light-gray dark:bg-dark-border rounded-full">
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


const OnboardingScreen: React.FC = () => {
    const { register, users, cancelRegistration } = useAppContext();
    const [step, setStep] = useState(1);
    const totalSteps = 6;
    
    const [profile, setProfile] = useState<Omit<UserProfile, 'id'>>({ 
        name: '', age: 25, avatar: '🧑‍🦰', gender: Gender.Male, 
        height: 68, activityLevel: ActivityLevel.LightlyActive, primaryGoal: PrimaryGoal.LoseWeight,
        unitSystem: UnitSystem.Imperial,
    });
    const [weight, setWeight] = useState(180); // Always stored in lbs

    const hasUsers = users.length > 0;
    
    const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
    const handleBack = () => {
        if (step === 1 && hasUsers) {
            cancelRegistration();
        } else {
            setStep(s => Math.max(s - 1, 1));
        }
    };
    
    const handleSubmit = () => {
        if (profile.name.trim() && profile.age > 0 && weight > 0) {
            register(profile, weight);
        } else {
            alert("Please ensure all fields are filled correctly.");
        }
    };

    const isStep1Valid = profile.name.trim().length > 0;
    const isStep2Valid = profile.age > 0;
    const isStep3Valid = profile.height > 0 && weight > 0;
    
    const calculatedGoals = useMemo(() => {
        const weightInKg = weight / 2.20462;
        const heightInCm = profile.height * 2.54;
        
        let bmr: number;
        if (profile.gender === Gender.Male) bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age) + 5;
        else if (profile.gender === Gender.Female) bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age) - 161;
        else bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age) - 78;

        const activityMultipliers = { [ActivityLevel.Sedentary]: 1.2, [ActivityLevel.LightlyActive]: 1.375, [ActivityLevel.ModeratelyActive]: 1.55, [ActivityLevel.Active]: 1.725, [ActivityLevel.VeryActive]: 1.9 };
        const maintenanceCalories = bmr * activityMultipliers[profile.activityLevel];

        let targetCalories: number;
        if (profile.primaryGoal === PrimaryGoal.LoseWeight) targetCalories = maintenanceCalories - 500;
        else if (profile.primaryGoal === PrimaryGoal.GainMuscle) targetCalories = maintenanceCalories + 300;
        else targetCalories = maintenanceCalories;
        
        const carbs = Math.round((targetCalories * 0.40) / 4);
        const protein = Math.round((targetCalories * 0.30) / 4);
        const fats = Math.round((targetCalories * 0.30) / 9);

        return { calories: Math.round(targetCalories), protein, carbs, fats };
    }, [profile, weight]);


    const renderStepContent = () => {
        switch (step) {
            case 1: return (
                <>
                    <h2 className="text-3xl font-bold text-text-main dark:text-dark-text-main mb-2">Welcome! What's your name?</h2>
                    <p className="text-text-light dark:text-dark-text-light mb-8">Let's start with the basics.</p>
                    <input id="name" name="name" type="text" value={profile.name} onChange={(e) => setProfile(p => ({...p, name: e.target.value}))} placeholder="e.g., Alex Doe" className="w-full bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main p-4 rounded-xl border-2 border-light-gray dark:border-dark-border focus:border-primary focus:ring-0 outline-none" required/>
                    <div className="mt-8">
                        <StepButton onClick={handleNext} text="Next" disabled={!isStep1Valid} />
                    </div>
                </>
            );
            case 2: return (
                <>
                    <h2 className="text-3xl font-bold text-text-main dark:text-dark-text-main mb-2">Tell us about yourself</h2>
                    <p className="text-text-light dark:text-dark-text-light mb-8">This helps us personalize your plan.</p>
                     <div className="space-y-6">
                        <div>
                            <label htmlFor="age" className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Age</label>
                            <input id="age" name="age" type="number" value={profile.age || ''} onChange={(e) => setProfile(p => ({...p, age: parseInt(e.target.value) || 0}))} className="w-full bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main p-4 rounded-xl border-2 border-light-gray dark:border-dark-border focus:border-primary focus:ring-0 outline-none" required/>
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Gender</label>
                            <select id="gender" name="gender" value={profile.gender} onChange={(e) => setProfile(p => ({...p, gender: e.target.value as Gender}))} className="w-full bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main p-4 rounded-xl border-2 border-light-gray dark:border-dark-border focus:border-primary focus:ring-0 outline-none">
                                {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mt-8">
                        <StepButton onClick={handleNext} text="Next" disabled={!isStep2Valid} />
                    </div>
                </>
            );
            case 3: return (
                 <>
                    <h2 className="text-3xl font-bold text-text-main dark:text-dark-text-main mb-2">Your measurements</h2>
                    <p className="text-text-light dark:text-dark-text-light mb-8">Used to calculate your daily energy needs.</p>
                     <div className="space-y-6">
                        <UnitSelector selected={profile.unitSystem} onSelect={(system) => setProfile(p => ({ ...p, unitSystem: system }))} />
                        
                        {profile.unitSystem === UnitSystem.Metric ? (
                            <>
                                <div>
                                    <label htmlFor="height_cm" className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Height (cm)</label>
                                    <input id="height_cm" type="number" value={Math.round(inchesToCm(profile.height))} onChange={(e) => setProfile(p => ({ ...p, height: cmToInches(parseInt(e.target.value) || 0) }))} className="w-full bg-card dark:bg-dark-card p-4 rounded-xl border-2 border-light-gray dark:border-dark-border text-text-main dark:text-dark-text-main focus:border-primary focus:ring-0 outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="weight_kg" className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Current Weight (kg)</label>
                                    <input id="weight_kg" type="number" value={lbsToKg(weight).toFixed(1)} onChange={(e) => setWeight(kgToLbs(parseFloat(e.target.value) || 0))} className="w-full bg-card dark:bg-dark-card p-4 rounded-xl border-2 border-light-gray dark:border-dark-border text-text-main dark:text-dark-text-main focus:border-primary focus:ring-0 outline-none" required />
                                </div>
                            </>
                        ) : (
                             <>
                                <div>
                                    <label className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Height</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={Math.floor(profile.height / 12)} onChange={(e) => setProfile(p => ({...p, height: (parseInt(e.target.value) || 0) * 12 + (p.height % 12)}))} className="w-full bg-card dark:bg-dark-card p-4 rounded-xl border-2 border-light-gray dark:border-dark-border text-text-main dark:text-dark-text-main focus:border-primary focus:ring-0 outline-none" placeholder="ft"/>
                                        <input type="number" value={profile.height % 12} onChange={(e) => setProfile(p => ({...p, height: Math.floor(p.height / 12) * 12 + (parseInt(e.target.value) || 0)}))} className="w-full bg-card dark:bg-dark-card p-4 rounded-xl border-2 border-light-gray dark:border-dark-border text-text-main dark:text-dark-text-main focus:border-primary focus:ring-0 outline-none" placeholder="in"/>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="weight_lbs" className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Current Weight (lbs)</label>
                                    <input id="weight_lbs" name="weight" type="number" value={weight || ''} onChange={(e) => setWeight(parseInt(e.target.value) || 0)} className="w-full bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main p-4 rounded-xl border-2 border-light-gray dark:border-dark-border focus:border-primary focus:ring-0 outline-none" required/>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="mt-8">
                        <StepButton onClick={handleNext} text="Next" disabled={!isStep3Valid} />
                    </div>
                </>
            );
            case 4: return (
                <>
                    <h2 className="text-3xl font-bold text-text-main dark:text-dark-text-main mb-2">How active are you?</h2>
                    <p className="text-text-light dark:text-dark-text-light mb-8">Be honest! This helps tailor your calorie goal.</p>
                    <div className="space-y-3">
                        <SelectionCard title="Sedentary" description="Little to no exercise, office job" isSelected={profile.activityLevel === ActivityLevel.Sedentary} onSelect={() => setProfile(p => ({...p, activityLevel: ActivityLevel.Sedentary}))}/>
                        <SelectionCard title="Lightly Active" description="Light exercise/sports 1-3 days/week" isSelected={profile.activityLevel === ActivityLevel.LightlyActive} onSelect={() => setProfile(p => ({...p, activityLevel: ActivityLevel.LightlyActive}))}/>
                        <SelectionCard title="Moderately Active" description="Moderate exercise 3-5 days/week" isSelected={profile.activityLevel === ActivityLevel.ModeratelyActive} onSelect={() => setProfile(p => ({...p, activityLevel: ActivityLevel.ModeratelyActive}))}/>
                        <SelectionCard title="Active" description="Hard exercise 6-7 days/week" isSelected={profile.activityLevel === ActivityLevel.Active} onSelect={() => setProfile(p => ({...p, activityLevel: ActivityLevel.Active}))}/>
                        <SelectionCard title="Very Active" description="Very hard exercise & physical job" isSelected={profile.activityLevel === ActivityLevel.VeryActive} onSelect={() => setProfile(p => ({...p, activityLevel: ActivityLevel.VeryActive}))}/>
                    </div>
                     <div className="mt-8">
                        <StepButton onClick={handleNext} text="Next" />
                    </div>
                </>
            );
             case 5: return (
                <>
                    <h2 className="text-3xl font-bold text-text-main dark:text-dark-text-main mb-2">What's your primary goal?</h2>
                    <p className="text-text-light dark:text-dark-text-light mb-8">We'll create a plan to help you reach it.</p>
                    <div className="space-y-3">
                        <SelectionCard title="Lose Weight" description="Create a calorie deficit to shed pounds" isSelected={profile.primaryGoal === PrimaryGoal.LoseWeight} onSelect={() => setProfile(p => ({...p, primaryGoal: PrimaryGoal.LoseWeight}))}/>
                        <SelectionCard title="Maintain Weight" description="Keep your current weight with a balanced plan" isSelected={profile.primaryGoal === PrimaryGoal.MaintainWeight} onSelect={() => setProfile(p => ({...p, primaryGoal: PrimaryGoal.MaintainWeight}))}/>
                        <SelectionCard title="Gain Muscle" description="Fuel your body to build lean mass" isSelected={profile.primaryGoal === PrimaryGoal.GainMuscle} onSelect={() => setProfile(p => ({...p, primaryGoal: PrimaryGoal.GainMuscle}))}/>
                    </div>
                    <div className="mt-8">
                        <StepButton onClick={handleNext} text="Review My Plan" />
                    </div>
                </>
            );
            case 6: return (
                <>
                    <h2 className="text-3xl font-bold text-text-main dark:text-dark-text-main mb-2">Your Personalized Plan</h2>
                    <p className="text-text-light dark:text-dark-text-light mb-8">Here's the starting plan we've created for you. You can adjust this later in settings.</p>
                    <div className="bg-card dark:bg-dark-card p-6 rounded-2xl text-center mb-6">
                        <p className="text-sm text-text-light dark:text-dark-text-light">Daily Calorie Goal</p>
                        <p className="text-6xl font-extrabold text-primary">{calculatedGoals.calories}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-card dark:bg-dark-card p-4 rounded-xl">
                            <p className="text-2xl font-bold text-protein">{calculatedGoals.protein}g</p><p className="text-xs text-text-light dark:text-dark-text-light">Protein</p>
                        </div>
                        <div className="bg-card dark:bg-dark-card p-4 rounded-xl">
                            <p className="text-2xl font-bold text-carbs">{calculatedGoals.carbs}g</p><p className="text-xs text-text-light dark:text-dark-text-light">Carbs</p>
                        </div>
                        <div className="bg-card dark:bg-dark-card p-4 rounded-xl">
                            <p className="text-2xl font-bold text-fats">{calculatedGoals.fats}g</p><p className="text-xs text-text-light dark:text-dark-text-light">Fats</p>
                        </div>
                    </div>
                     <div className="mt-8">
                        <StepButton onClick={handleSubmit} text="Start My Journey!" />
                    </div>
                </>
            );
            default: return null;
        }
    }

    return (
        <div className="max-w-md mx-auto h-screen bg-background dark:bg-dark-background font-sans flex flex-col p-6 animate-fade-in">
            <header className="flex items-center">
                <button onClick={handleBack} className="p-2 -ml-2">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
            </header>
            <div className="py-4">
                 <ProgressBar step={step} totalSteps={totalSteps} />
            </div>
            <div className="flex-1">
                {renderStepContent()}
            </div>
        </div>
    );
};

export default OnboardingScreen;