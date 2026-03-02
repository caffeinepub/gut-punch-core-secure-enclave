import { useEffect, useRef } from 'react';
import { useTrackAppOpen } from './useQueries';

const SESSION_KEY = 'app_open_tracked';

export function useTrackAppOpenOnce() {
    const trackAppOpen = useTrackAppOpen();
    const hasTracked = useRef(false);

    useEffect(() => {
        if (hasTracked.current) return;

        const alreadyTracked = sessionStorage.getItem(SESSION_KEY);
        if (alreadyTracked) {
            hasTracked.current = true;
            return;
        }

        trackAppOpen.mutate(undefined, {
            onSuccess: () => {
                sessionStorage.setItem(SESSION_KEY, 'true');
                hasTracked.current = true;
            },
            onError: () => {
                sessionStorage.setItem(SESSION_KEY, 'true');
                hasTracked.current = true;
            },
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
