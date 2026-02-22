import { useState } from 'react';
import { Heart, Eye, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLikePunch, useUnlikePunch, useDeletePunch } from '../hooks/usePunches';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import type { Punch } from '../backend';
import { toast } from 'sonner';

interface PunchCardProps {
    punch: Punch;
}

export default function PunchCard({ punch }: PunchCardProps) {
    const { identity } = useInternetIdentity();
    const { data: userProfile } = useGetCallerUserProfile();
    const likePunch = useLikePunch();
    const unlikePunch = useUnlikePunch();
    const deletePunch = useDeletePunch();
    const [isLiked, setIsLiked] = useState(false);

    const isOwnPunch = identity?.getPrincipal().toString() === punch.userId.toString();

    const handleLike = async () => {
        if (!identity) {
            toast.error('Please sign in to like punches');
            return;
        }

        try {
            if (isLiked) {
                await unlikePunch.mutateAsync(punch.id);
                setIsLiked(false);
            } else {
                await likePunch.mutateAsync(punch.id);
                setIsLiked(true);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this punch?')) {
            try {
                await deletePunch.mutateAsync(punch.id);
                toast.success('Punch deleted successfully');
            } catch (error) {
                console.error('Error deleting punch:', error);
                toast.error('Failed to delete punch');
            }
        }
    };

    const getUserInitial = () => {
        if (userProfile?.name) {
            return userProfile.name.charAt(0).toUpperCase();
        }
        return punch.userId.toString().charAt(0).toUpperCase();
    };

    return (
        <Card className="bg-[#1a1a1a] border-[#DC143C]/20 hover:border-[#DC143C]/50 transition-all duration-300 p-4">
            <div className="flex gap-4">
                {/* Avatar */}
                <Avatar className="h-12 w-12 border-2 border-[#00FFFF]/30">
                    <AvatarFallback className="bg-[#DC143C]/20 text-[#DC143C]">
                        {getUserInitial()}
                    </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-semibold text-foreground">
                                {userProfile?.name || 'Anonymous User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(Number(punch.timestamp) / 1_000_000).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <img
                                src="/assets/generated/dragon-icon-small.dim_32x32.png"
                                alt="Dragon"
                                className="h-6 w-6"
                            />
                            {isOwnPunch && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDelete}
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <p className="text-foreground whitespace-pre-wrap">{punch.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-2">
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-2 text-sm hover:text-[#DC143C] transition-colors"
                        >
                            <Heart
                                className={`h-5 w-5 ${isLiked ? 'fill-[#DC143C] text-[#DC143C]' : ''}`}
                            />
                            <span className="text-[#00FFFF]">{Number(punch.likes)}</span>
                        </button>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Eye className="h-5 w-5" />
                            <span className="text-[#00FFFF]">{Number(punch.views)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
