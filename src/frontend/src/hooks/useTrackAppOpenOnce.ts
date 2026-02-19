import { useEffect, useRef } from 'react';
import { useTrackAppOpen } from './useQueries';

const SESSION_KEY = 'app_open_tracked';

export function useTrackAppOpenOnce() {
    const trackAppOpen = useTrackAppOpen();
    const hasTracked = useRef(false);

    useEffect(() => {
        // Check if already tracked in this session
        if (hasTracked.current) return;
        
        const alreadyTracked = sessionStorage.getItem(SESSION_KEY);
        if (alreadyTracked) {
            hasTracked.current = true;
            return;
        }

        // Track app open (best effort, no blocking)
        trackAppOpen.mutate(undefined, {
            onSuccess: () => {
                sessionStorage.setItem(SESSION_KEY, 'true');
                hasTracked.current = true;
            },
            onError: (error) => {
                // Fail silently - don't block UI
                console.error('Failed to track app open:', error);
                // Still mark as tracked to avoid retries
                sessionStorage.setItem(SESSION_KEY, 'true');
                hasTracked.current = true;
            },
        });
    }, [trackAppOpen]);
}
