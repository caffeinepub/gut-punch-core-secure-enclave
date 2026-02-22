import { useState } from 'react';
import { useGetAllPunches, useCreatePunch } from '../hooks/usePunches';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PunchCard from './PunchCard';
import HotRightNow from './HotRightNow';

export default function SocialFeed() {
    const [punchText, setPunchText] = useState('');
    const { data: punches, isLoading } = useGetAllPunches();
    const createPunch = useCreatePunch();
    const { identity, login } = useInternetIdentity();
    const isAuthenticated = !!identity;

    const handleCreatePunch = async () => {
        if (!isAuthenticated) {
            toast.error('Login to throw a punch');
            await login();
            return;
        }

        if (!punchText.trim()) {
            toast.error('Type your punch first');
            return;
        }

        try {
            await createPunch.mutateAsync(punchText);
            setPunchText('');
            toast.success('Punch thrown!');
        } catch (error) {
            toast.error('Failed to throw punch');
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <img
                    src="/assets/generated/gargoyle-dragon-hero.dim_1200x600.png"
                    alt="Gargoyle Dragon"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
                
                <div className="relative z-10 text-center px-4 space-y-8">
                    <h1 className="text-6xl md:text-8xl font-bold text-primary blood-glow font-display">
                        Ready to Punch?
                    </h1>
                    
                    <div className="max-w-2xl mx-auto space-y-4">
                        <Textarea
                            placeholder="Type your punch…"
                            value={punchText}
                            onChange={(e) => setPunchText(e.target.value)}
                            className="min-h-[100px] bg-card/80 backdrop-blur border-primary/30 text-lg resize-none"
                        />
                        <Button
                            onClick={handleCreatePunch}
                            disabled={createPunch.isPending || !punchText.trim()}
                            className="w-full h-16 text-xl font-bold forged-metal border-2 border-primary hover:shadow-blood"
                        >
                            {createPunch.isPending ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                'START A GUT PUNCH'
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hot Right Now Section */}
            <div className="container py-8">
                <HotRightNow />
            </div>

            {/* All Punches Feed */}
            <div className="container py-8">
                <h2 className="text-3xl font-bold text-primary mb-6 font-display">All Punches</h2>
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : punches && punches.length > 0 ? (
                    <div className="space-y-4">
                        {punches.map((punch) => (
                            <PunchCard key={punch.id} punch={punch} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-12">
                        No punches yet. Punch through the bullshit and be the first.
                    </p>
                )}
            </div>
        </div>
    );
}
