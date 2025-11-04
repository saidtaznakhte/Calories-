
import React, { useState, useMemo } from 'react';
import { Page, ActivityType, CustomActivity } from '../types';
import { BackIcon, PlusIcon } from '../components/Icons';
import { useAppContext } from '../contexts/AppContext';
import { toYYYYMMDD } from '../utils/dateUtils';

const defaultActivityOptions = [
    { type: ActivityType.Running, emoji: '🏃', met: 9.8 },
    { type: ActivityType.Walking, emoji: '🚶', met: 3.5 },
    { type: ActivityType.Cycling, emoji: '🚴', met: 7.5 },
    { type: ActivityType.WeightLifting, emoji: '🏋️', met: 3.5 },
    { type: ActivityType.Yoga, emoji: '🧘', met: 2.5 },
    { type: ActivityType.Swimming, emoji: '🏊', met: 7.0 },
];

const ActivityButton: React.FC<{
    activity: {type: string, emoji: string};
    isSelected: boolean;
    onSelect: () => void;
}> = ({ activity, isSelected, onSelect }) => (
    <button
        onClick={onSelect}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 w-28 flex-shrink-0
            ${isSelected 
                ? 'bg-primary-light dark:bg-primary/30 border-primary scale-105 shadow-lg' 
                : 'bg-card dark:bg-dark-card border-transparent hover:border-primary/50'
            }`}
    >
        <span className="text-4xl mb-2">{activity.emoji}</span>
        <span className="font-semibold text-sm text-text-main dark:text-dark-text-main text-center">{activity.type}</span>
    </button>
);

const LogActivityScreen: React.FC = () => {
    const { navigateTo, handleActivityLogged, currentWeight, customActivities, handleCustomActivityAdd } = useAppContext();
    const [selectedActivity, setSelectedActivity] = useState<CustomActivity | null>(null);
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newActivity, setNewActivity] = useState({ type: '', emoji: '🏃', met: '' });

    const allActivities = useMemo(() => {
        return [...defaultActivityOptions, ...(customActivities || [])];
    }, [customActivities]);

    const totalDurationInMinutes = useMemo(() => {
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        return (h * 60) + m;
    }, [hours, minutes]);

    const caloriesBurned = useMemo(() => {
        if (!selectedActivity || totalDurationInMinutes <= 0 || currentWeight <= 0) {
            return 0;
        }
        // MET formula: MET * weight(kg) * duration(hours)
        const weightInKg = currentWeight / 2.20462;
        const durationInHours = totalDurationInMinutes / 60;
        const calories = selectedActivity.met * weightInKg * durationInHours;
        return Math.round(calories);
    }, [selectedActivity, totalDurationInMinutes, currentWeight]);

    const handleLog = () => {
        if (!selectedActivity || totalDurationInMinutes <= 0) {
            alert('Please select an activity and enter a valid duration.');
            return;
        }

        handleActivityLogged({
            name: `${selectedActivity.type}`,
            type: selectedActivity.type,
            duration: totalDurationInMinutes,
            caloriesBurned,
            date: toYYYYMMDD(new Date()),
        });
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewActivity({ type: '', emoji: '🏃', met: '' }); // Reset form
    };

    const handleSaveNewActivity = () => {
        const metValue = parseFloat(newActivity.met);
        if (newActivity.type.trim() && newActivity.emoji && !isNaN(metValue) && metValue > 0) {
            handleCustomActivityAdd({
                type: newActivity.type.trim(),
                emoji: newActivity.emoji,
                met: metValue,
            });
            handleCloseModal();
        } else {
            alert('Please fill in all fields correctly. MET must be a positive number.');
        }
    };


    return (
        <div className="p-4 flex flex-col h-full bg-background dark:bg-dark-background">
            <header className="flex items-center mb-6">
                <button onClick={() => navigateTo(Page.Dashboard)} className="p-2 -ml-2">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto">Log Activity</h1>
                <div className="w-6"></div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="bg-card dark:bg-dark-card rounded-2xl p-6 shadow-sm mb-6">
                    <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-4">Choose Your Activity</h2>
                    <div className="flex space-x-4 overflow-x-auto pb-4 -mx-6 px-6">
                        {allActivities.map(activity => (
                            <ActivityButton 
                                key={activity.type}
                                activity={activity}
                                isSelected={selectedActivity?.type === activity.type}
                                onSelect={() => setSelectedActivity(activity)}
                            />
                        ))}
                         <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 w-28 flex-shrink-0 transition-colors hover:border-primary hover:text-primary"
                        >
                            <PlusIcon className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
                            <span className="font-semibold text-sm text-center">Add New</span>
                        </button>
                    </div>
                </div>

                {selectedActivity && (
                    <div className="bg-card dark:bg-dark-card rounded-2xl p-6 shadow-sm animate-fade-in">
                        <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-4">Duration</h2>
                        <div className="flex items-baseline justify-center bg-light-gray dark:bg-dark-border p-4 rounded-xl">
                            <input 
                                type="number"
                                value={hours}
                                onChange={(e) => setHours(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="0"
                                aria-label="Hours"
                                className="text-4xl font-bold text-text-main dark:text-dark-text-main bg-transparent w-24 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-2xl font-medium text-text-light dark:text-dark-text-light mx-1">h</span>
                            <input 
                                type="number"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="00"
                                aria-label="Minutes"
                                className="text-4xl font-bold text-text-main dark:text-dark-text-main bg-transparent w-24 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                             <span className="text-2xl font-medium text-text-light dark:text-dark-text-light mx-1">m</span>
                        </div>
                        <p className="text-center text-text-light dark:text-dark-text-light mt-4">
                            Estimated <span className="font-bold text-secondary">{caloriesBurned}</span> calories burned
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <button 
                    onClick={handleLog} 
                    disabled={!selectedActivity || totalDurationInMinutes <= 0}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-primary/90 transition-colors disabled:bg-gray-300 dark:disabled:bg-dark-border disabled:cursor-not-allowed"
                >
                    Log Activity
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" onClick={handleCloseModal}>
                    <div className="bg-card dark:bg-dark-card rounded-2xl p-6 shadow-xl w-11/12 max-w-sm animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-text-main dark:text-dark-text-main mb-6">Add Custom Activity</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Activity Name</label>
                                <input type="text" value={newActivity.type} onChange={(e) => setNewActivity(s => ({...s, type: e.target.value}))} placeholder="e.g., Rock Climbing" className="w-full bg-light-gray dark:bg-dark-border p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Emoji</label>
                                    <input type="text" value={newActivity.emoji} onChange={(e) => setNewActivity(s => ({...s, emoji: e.target.value}))} maxLength={2} className="w-full bg-light-gray dark:bg-dark-border p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none text-center" />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">MET Value</label>
                                    <input type="number" value={newActivity.met} onChange={(e) => setNewActivity(s => ({...s, met: e.target.value}))} placeholder="e.g., 8.0" className="w-full bg-light-gray dark:bg-dark-border p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" />
                                </div>
                            </div>
                             <p className="text-xs text-text-light dark:text-dark-text-light pt-1">
                                MET is a measure of intensity. Walking is 3.5, running is 9.8. Search online for accurate values.
                            </p>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button onClick={handleCloseModal} className="flex-1 py-3 rounded-xl bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main font-semibold">Cancel</button>
                            <button onClick={handleSaveNewActivity} className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogActivityScreen;