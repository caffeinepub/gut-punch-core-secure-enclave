import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Punch } from '../backend';

export function useGetAllPunches() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<Punch[]>({
        queryKey: ['punches'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getAllPunches();
        },
        enabled: !!actor && !actorFetching,
    });
}

export function useGetTrendingPunches(limit: number = 10) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<Punch[]>({
        queryKey: ['trendingPunches', limit],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getTrendingPunches(BigInt(limit));
        },
        enabled: !!actor && !actorFetching,
    });
}

export function useGetUserPunches() {
    const { actor, isFetching: actorFetching } = useActor();
    const { identity } = useInternetIdentity();
    const { data: allPunches } = useGetAllPunches();

    return useQuery<Punch[]>({
        queryKey: ['userPunches', identity?.getPrincipal().toString()],
        queryFn: async () => {
            if (!identity || !allPunches) return [];
            const userPrincipal = identity.getPrincipal().toString();
            return allPunches.filter(punch => punch.userId.toString() === userPrincipal);
        },
        enabled: !!actor && !actorFetching && !!identity && !!allPunches,
    });
}

export function useCreatePunch() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (content: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createPunch(content);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['punches'] });
            queryClient.invalidateQueries({ queryKey: ['trendingPunches'] });
            queryClient.invalidateQueries({ queryKey: ['userPunches'] });
        },
    });
}

export function useLikePunch() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (punchId: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.likePunch(punchId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['punches'] });
            queryClient.invalidateQueries({ queryKey: ['trendingPunches'] });
        },
    });
}

export function useUnlikePunch() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (punchId: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.unlikePunch(punchId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['punches'] });
            queryClient.invalidateQueries({ queryKey: ['trendingPunches'] });
        },
    });
}

export function useDeletePunch() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (punchId: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.deletePunch(punchId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['punches'] });
            queryClient.invalidateQueries({ queryKey: ['trendingPunches'] });
            queryClient.invalidateQueries({ queryKey: ['userPunches'] });
        },
    });
}

export function useIncrementPunchViews() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (punchId: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.incrementPunchViews(punchId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['punches'] });
            queryClient.invalidateQueries({ queryKey: ['trendingPunches'] });
        },
    });
}
