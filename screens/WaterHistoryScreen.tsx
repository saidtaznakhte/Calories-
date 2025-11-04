import React, { useMemo } from 'react';
import { Page } from '../types';
import { BackIcon } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDate, toYYYYMMDD } from '../utils/dateUtils';
import { useAppContext } from '../contexts/AppContext';

const WaterHistoryScreen: React.FC = () => {
    const { navigateTo, waterIntakeHistory: history, waterGoal, theme } = useAppContext();
    const isDarkMode = theme === 'dark';
    const axisColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    const gridColor = isDarkMode ? '#374151' : '#E5E7EB';
    const tooltipStyle = {
      backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: '0.5rem',
      border: `1px solid ${isDarkMode ? '#334151' : '#e5e7eb'}`,
      color: isDarkMode ? '#F8FAFC' : '#1E293B'
    };

    const last7DaysData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = toYYYYMMDD(date);
            const intake = history[dateString] || 0;
            data.push({
                date: dateString,
                intake: intake,
                goal: waterGoal,
                formattedDate: formatDate(date, { month: 'short', day: 'numeric' })
            });
        }
        return data;
    }, [history, waterGoal]);

    const loggedEntries = useMemo(() => {
        return Object.entries(history)
            .map(([date, intake]) => ({ date, intake }))
            .filter(entry => entry.intake > 0)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [history]);

    return (
        <div className="p-4 flex flex-col h-full bg-background dark:bg-dark-background">
            <header className="flex items-center mb-6">
                <button onClick={() => navigateTo(Page.Settings)} className="p-2 -ml-2">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto">Water Intake History</h1>
                <div className="w-6"></div>
            </header>

            <div className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm mb-6">
                <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-4">Last 7 Days (fl oz)</h2>
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <BarChart data={last7DaysData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="formattedDate" fontSize={12} tickLine={false} axisLine={false} stroke={axisColor} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} stroke={axisColor} />
                            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDarkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(229, 231, 235, 0.4)'}} />
                            <Bar dataKey="intake" fill="#3B82F6" name="Intake" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-2">Log Entries</h2>
                {loggedEntries.length > 0 ? (
                    <div className="space-y-2">
                        {loggedEntries.map((entry, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-light-gray dark:border-dark-border last:border-b-0">
                               <p className="text-text-main dark:text-dark-text-main">{formatDate(new Date(entry.date), { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                               <p className="font-bold text-text-main dark:text-dark-text-main">{entry.intake} fl oz</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-medium-gray dark:text-dark-gray">
                        <p>No water intake logged yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaterHistoryScreen;