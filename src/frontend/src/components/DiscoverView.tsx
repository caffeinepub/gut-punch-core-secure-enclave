import { useGetTrendingPunches } from '../hooks/usePunches';
import PunchCard from './PunchCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Compass } from 'lucide-react';

export default function DiscoverView() {
    const { data: trendingPunches, isLoading } = useGetTrendingPunches(20);

    return (
        <div className="min-h-screen bg-background pt-14">
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Compass className="h-8 w-8 text-[#00FFFF]" />
                    <h1 className="text-3xl font-bold text-[#DC143C]">Discover</h1>
                </div>

                <div className="space-y-4">
                    {isLoading && (
                        <>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-40 w-full" />
                            ))}
                        </>
                    )}

                    {trendingPunches && trendingPunches.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                No trending punches yet. Check back later!
                            </p>
                        </div>
                    )}

                    {trendingPunches?.map((punch) => (
                        <PunchCard key={punch.id} punch={punch} />
                    ))}
                </div>
            </div>
        </div>
    );
}
