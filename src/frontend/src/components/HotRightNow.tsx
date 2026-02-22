import { useGetTrendingPunches } from '../hooks/usePunches';
import { Card } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Punch } from '../backend';

export default function HotRightNow() {
    const { data: trendingPunches, isLoading } = useGetTrendingPunches(5);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#DC143C] flex items-center gap-2">
                    <Flame className="h-6 w-6" />
                    HOT RIGHT NOW
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="min-w-[300px] h-32" />
                    ))}
                </div>
            </div>
        );
    }

    if (!trendingPunches || trendingPunches.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#DC143C] flex items-center gap-2">
                <Flame className="h-6 w-6" />
                HOT RIGHT NOW
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {trendingPunches.map((punch: Punch) => (
                    <Card
                        key={punch.id}
                        className="min-w-[300px] bg-[#1a1a1a] border-[#00FFFF]/30 p-4 hover:border-[#00FFFF] transition-colors cursor-pointer"
                    >
                        <p className="text-sm text-foreground line-clamp-3 mb-2">
                            {punch.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="text-[#DC143C]">❤️ {Number(punch.likes)}</span>
                            <span className="text-[#00FFFF]">👁️ {Number(punch.views)}</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
