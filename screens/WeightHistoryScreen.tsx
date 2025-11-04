import React from 'react';
import { Page, Theme } from '../types';
import { BackIcon } from '../components/Icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from 'recharts';
import { formatDate } from '../utils/dateUtils';
import { useAppContext } from '../contexts/AppContext';
import { getDisplayWeight, formatWeight } from '../utils/units';

const WeightHistoryScreen: React.FC = () => {
    const { navigateTo, weightHistory: history, theme, profile } = useAppContext();
    const { unitSystem } = profile;
    const isMetric = unitSystem === 'metric';

    const isDarkMode = theme === 'dark';
    const axisColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    const gridColor = isDarkMode ? '#374151' : '#E5E7EB';
    const tooltipStyle = {
      backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: '0.5rem',
      border: `1px solid ${isDarkMode ? '#334151' : '#e5e7eb'}`,
      color: isDarkMode ? '#F8FAFC' : '#1E293B'
    };

    const formattedHistory = history.map(entry => ({
        ...entry,
        displayWeight: getDisplayWeight(entry.weight, unitSystem),
        formattedDate: formatDate(new Date(entry.date), { month: 'short', day: 'numeric' })
    }));

    // FIX: Corrected typo from getDisplayweight to getDisplayWeight.
    const yMin = history.length > 0 ? Math.min(...history.map(h => getDisplayWeight(h.weight, unitSystem))) - 2 : 0;
    // FIX: Corrected typo from getDisplayweight to getDisplayWeight.
    const yMax = history.length > 0 ? Math.max(...history.map(h => getDisplayWeight(h.weight, unitSystem))) + 2 : 100;

    return (
        <div className="p-4 flex flex-col h-full bg-background dark:bg-dark-background">
            <header className="flex items-center mb-6">
                <button onClick={() => navigateTo(Page.Settings)} className="p-2 -ml-2">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto">Weight History</h1>
                <div className="w-6"></div>
            </header>

            <div className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm mb-6">
                <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-4">Your Progress</h2>
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <LineChart data={formattedHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="formattedDate" fontSize={12} tickLine={false} axisLine={false} stroke={axisColor} />
                            <YAxis 
                                domain={[yMin, yMax]} 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                stroke={axisColor}
                                unit={isMetric ? 'kg' : 'lbs'}
                            />
                            <Tooltip 
                                contentStyle={tooltipStyle} 
                                formatter={(value: number) => [`${value.toFixed(1)} ${isMetric ? 'kg' : 'lbs'}`, 'Weight']}
                            />
                            <Line type="monotone" dataKey="displayWeight" stroke="#00C795" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Weight" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-2">Log Entries</h2>
                <div className="space-y-2">
                    {history.length > 0 ? formattedHistory.slice().reverse().map((entry, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-light-gray dark:border-dark-border last:border-b-0">
                           <p className="text-text-main dark:text-dark-text-main">{formatDate(new Date(entry.date), { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                           <p className="font-bold text-text-main dark:text-dark-text-main">{formatWeight(entry.weight, unitSystem)}</p>
                        </div>
                    )) : (
                        <p className="text-center text-medium-gray dark:text-dark-gray py-8">No weight entries yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WeightHistoryScreen;