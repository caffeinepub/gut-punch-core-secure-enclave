import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Product, ShoppingItem, StripeConfiguration, UsageStats, MarketConfig, UserUsageStats } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
    const { actor, isFetching: actorFetching } = useActor();
    const { identity } = useInternetIdentity();

    const query = useQuery<UserProfile | null>({
        queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
        queryFn: async () => {
            if (!actor || !identity) throw new Error('Actor or identity not available');
            const principal = identity.getPrincipal();
            return actor.getUserProfile(principal);
        },
        enabled: !!actor && !actorFetching && !!identity,
        retry: false,
    });

    return {
        ...query,
        isLoading: actorFetching || query.isLoading,
        isFetched: !!actor && query.isFetched,
    };
}

export function useSaveCallerUserProfile() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profile: UserProfile) => {
            if (!actor) throw new Error('Actor not available');
            return actor.saveCallerUserProfile(profile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}

// Admin Role Queries
export function useIsCallerAdmin() {
    const { actor, isFetching: actorFetching } = useActor();
    const { identity } = useInternetIdentity();

    return useQuery<boolean>({
        queryKey: ['isAdmin', identity?.getPrincipal().toString()],
        queryFn: async () => {
            if (!actor) return false;
            try {
                return await actor.isCallerAdmin();
            } catch (error) {
                console.error('Error checking admin status:', error);
                return false;
            }
        },
        enabled: !!actor && !actorFetching && !!identity,
        staleTime: 1000 * 60 * 10,
        retry: false,
    });
}

// Product Queries
export function useGetProducts() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getProducts();
        },
        enabled: !!actor && !actorFetching,
    });
}

// Stripe Queries
export function useIsStripeConfigured() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<boolean>({
        queryKey: ['stripeConfigured'],
        queryFn: async () => {
            if (!actor) return false;
            try {
                return await actor.isStripeConfigured();
            } catch (error) {
                console.error('Error checking Stripe configuration:', error);
                return false;
            }
        },
        enabled: !!actor && !actorFetching,
        retry: false,
    });
}

export function useSetStripeConfiguration() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (config: StripeConfiguration) => {
            if (!actor) throw new Error('Actor not available');
            return actor.setStripeConfiguration(config);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
        },
    });
}

export type CheckoutSession = {
    id: string;
    url: string;
};

export function useCreateCheckoutSession() {
    const { actor } = useActor();

    return useMutation({
        mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
            if (!actor) throw new Error('Actor not available');
            const baseUrl = `${window.location.protocol}//${window.location.host}`;
            const successUrl = `${baseUrl}/payment-success`;
            const cancelUrl = `${baseUrl}/payment-failure`;
            const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
            const session = JSON.parse(result) as CheckoutSession;
            if (!session?.url) {
                throw new Error('Stripe session missing url');
            }
            return session;
        },
    });
}

export function useGetStripeSessionStatus() {
    const { actor } = useActor();

    return useMutation({
        mutationFn: async (sessionId: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.getStripeSessionStatus(sessionId);
        },
    });
}

// Usage Analytics Queries
export function useTrackAppOpen() {
    const { actor } = useActor();

    return useMutation({
        mutationFn: async () => {
            if (!actor) {
                return;
            }
            try {
                await actor.trackAppOpen();
            } catch (error) {
                console.error('Failed to track app open:', error);
            }
        },
        retry: false,
    });
}

export function useGetUsageStats() {
    const { actor, isFetching: actorFetching } = useActor();
    const { data: isAdmin } = useIsCallerAdmin();

    return useQuery<UsageStats>({
        queryKey: ['usageStats'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getUsageStats();
        },
        enabled: !!actor && !actorFetching && isAdmin === true,
        retry: false,
    });
}

// User Usage Stats (Daily Scans)
export function useGetCallerUsageStats() {
    const { actor, isFetching: actorFetching } = useActor();
    const { identity } = useInternetIdentity();

    return useQuery<UserUsageStats | null>({
        queryKey: ['callerUsageStats', identity?.getPrincipal().toString()],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getCallerUsageStats();
        },
        enabled: !!actor && !actorFetching && !!identity,
        retry: false,
    });
}

export function useIncrementDailyScans() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.incrementDailyScans();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['callerUsageStats'] });
        },
    });
}

// App Market Configuration Queries
export function useGetMarketConfig() {
    const { actor, isFetching: actorFetching } = useActor();
    const { data: isAdmin } = useIsCallerAdmin();

    return useQuery<MarketConfig>({
        queryKey: ['marketConfig'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getMarketConfig();
        },
        enabled: !!actor && !actorFetching && isAdmin === true,
        retry: false,
    });
}

export function useUpdateMarketConfig() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (config: MarketConfig) => {
            if (!actor) throw new Error('Actor not available');
            return actor.updateMarketConfig(config);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketConfig'] });
        },
    });
}

export function usePublish() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.publish();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketConfig'] });
        },
    });
}
