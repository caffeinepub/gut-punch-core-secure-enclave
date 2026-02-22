import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ChatMessage } from '../backend';
import type { Principal } from '@dfinity/principal';

export function useGetConversation(otherUserId: Principal | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<ChatMessage[]>({
        queryKey: ['conversation', otherUserId?.toString()],
        queryFn: async () => {
            if (!actor || !otherUserId) throw new Error('Actor or user ID not available');
            return actor.getConversation(otherUserId);
        },
        enabled: !!actor && !actorFetching && !!otherUserId,
    });
}

export function useSendMessage() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ receiverId, content }: { receiverId: Principal; content: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.sendMessage(receiverId, content);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['conversation', variables.receiverId.toString()],
            });
        },
    });
}

export function useMarkAsRead() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (messageId: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.markMessageAsRead(messageId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversation'] });
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
        },
    });
}

export function useGetOnlineStatus(userId: Principal | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<boolean>({
        queryKey: ['onlineStatus', userId?.toString()],
        queryFn: async () => {
            if (!actor || !userId) return false;
            return actor.getOnlineStatus(userId);
        },
        enabled: !!actor && !actorFetching && !!userId,
        refetchInterval: 30000, // Refresh every 30 seconds
    });
}

export function useSetOnlineStatus() {
    const { actor } = useActor();

    return useMutation({
        mutationFn: async (isOnline: boolean) => {
            if (!actor) throw new Error('Actor not available');
            return actor.setOnlineStatus(isOnline);
        },
    });
}

export function useGetUnreadMessageCount() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<bigint>({
        queryKey: ['unreadCount'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getUnreadMessageCount();
        },
        enabled: !!actor && !actorFetching,
        refetchInterval: 30000, // Refresh every 30 seconds
    });
}
