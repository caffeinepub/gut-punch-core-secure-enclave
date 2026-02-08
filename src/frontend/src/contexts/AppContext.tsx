import { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';

export type AnalysisMode = 'paranoid' | 'balanced' | 'vent';

export type SubscriptionStatus = 'free' | 'proMonthly' | 'proAnnual';

export interface AnalysisResult {
    id: string;
    timestamp: number;
    text: string;
    score: number;
    triggers: DetectedTrigger[];
    mode: AnalysisMode;
}

export interface DetectedTrigger {
    type: 'financial' | 'urgency' | 'coercion' | 'suspicious';
    pattern: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    context: string;
    educationalInfo: string;
}

export interface AppSettings {
    mode: AnalysisMode;
    debounceMs: number;
    persistHistory: boolean;
    maxHistoryItems: number;
}

export interface SubscriptionInfo {
    status: SubscriptionStatus;
    expiresAt?: number;
    lastChecked: number;
}

interface AppContextType {
    settings: AppSettings;
    updateSettings: (settings: Partial<AppSettings>) => void;
    history: AnalysisResult[];
    addToHistory: (result: AnalysisResult) => void;
    clearHistory: () => void;
    deleteHistoryItem: (id: string) => void;
    exportHistory: () => void;
    geminiApiKey: string;
    setGeminiApiKey: (key: string) => void;
    stripePublishableKey: string;
    setStripePublishableKey: (key: string) => void;
    subscriptionInfo: SubscriptionInfo;
    updateSubscriptionInfo: (info: SubscriptionInfo) => void;
    isPro: boolean;
    dailyScans: number;
    incrementDailyScans: () => void;
    resetDailyScans: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
    mode: 'balanced',
    debounceMs: 500,
    persistHistory: true,
    maxHistoryItems: 100,
};

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
    status: 'free',
    lastChecked: Date.now(),
};

const FREE_TIER_DAILY_LIMIT = 10;

export function AppProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = usePersistedState<AppSettings>('zts-settings', DEFAULT_SETTINGS);
    const [history, setHistory] = usePersistedState<AnalysisResult[]>('zts-history', []);
    const [geminiApiKey, setGeminiApiKey] = usePersistedState<string>('zts-gemini-api-key', '');
    const [stripePublishableKey, setStripePublishableKey] = usePersistedState<string>('zts-stripe-publishable-key', '');
    const [subscriptionInfo, setSubscriptionInfo] = usePersistedState<SubscriptionInfo>('zts-subscription', DEFAULT_SUBSCRIPTION);
    const [dailyScans, setDailyScans] = usePersistedState<number>('zts-daily-scans', 0);
    const [lastScanDate, setLastScanDate] = usePersistedState<string>('zts-last-scan-date', new Date().toDateString());

    const isPro = subscriptionInfo.status === 'proMonthly' || subscriptionInfo.status === 'proAnnual';

    const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            
            if (newSettings.persistHistory === false) {
                localStorage.removeItem('zts-history');
                setHistory([]);
            }
            
            return updated;
        });
    }, [setSettings, setHistory]);

    const addToHistory = useCallback((result: AnalysisResult) => {
        if (!settings.persistHistory) return;
        
        setHistory((prev) => {
            const isDuplicate = prev.some(
                (item) => 
                    item.text === result.text && 
                    item.score === result.score &&
                    item.mode === result.mode
            );
            
            if (isDuplicate) return prev;
            
            const updated = [result, ...prev].slice(0, settings.maxHistoryItems);
            return updated;
        });
    }, [settings.persistHistory, settings.maxHistoryItems, setHistory]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem('zts-history');
    }, [setHistory]);

    const deleteHistoryItem = useCallback((id: string) => {
        setHistory((prev) => prev.filter((item) => item.id !== id));
    }, [setHistory]);

    const exportHistory = useCallback(() => {
        try {
            const dataStr = JSON.stringify(history, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `securedraft-history-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting history:', error);
        }
    }, [history]);

    const updateSubscriptionInfo = useCallback((info: SubscriptionInfo) => {
        setSubscriptionInfo(info);
    }, [setSubscriptionInfo]);

    const incrementDailyScans = useCallback(() => {
        const today = new Date().toDateString();
        if (today !== lastScanDate) {
            setDailyScans(1);
            setLastScanDate(today);
        } else {
            setDailyScans((prev) => prev + 1);
        }
    }, [lastScanDate, setDailyScans, setLastScanDate]);

    const resetDailyScans = useCallback(() => {
        setDailyScans(0);
        setLastScanDate(new Date().toDateString());
    }, [setDailyScans, setLastScanDate]);

    const contextValue = useMemo(
        () => ({
            settings,
            updateSettings,
            history,
            addToHistory,
            clearHistory,
            deleteHistoryItem,
            exportHistory,
            geminiApiKey,
            setGeminiApiKey,
            stripePublishableKey,
            setStripePublishableKey,
            subscriptionInfo,
            updateSubscriptionInfo,
            isPro,
            dailyScans,
            incrementDailyScans,
            resetDailyScans,
        }),
        [
            settings,
            updateSettings,
            history,
            addToHistory,
            clearHistory,
            deleteHistoryItem,
            exportHistory,
            geminiApiKey,
            setGeminiApiKey,
            stripePublishableKey,
            setStripePublishableKey,
            subscriptionInfo,
            updateSubscriptionInfo,
            isPro,
            dailyScans,
            incrementDailyScans,
            resetDailyScans,
        ]
    );

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}

export { FREE_TIER_DAILY_LIMIT };
