import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScanLine, Loader2, AlertTriangle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUsageStats, useIncrementDailyScans } from '../hooks/useQueries';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

export default function ScanScreen() {
    const [scanText, setScanText] = useState('');
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const { isPro } = useApp();
    const { identity } = useInternetIdentity();
    const { data: usageStats } = useGetCallerUsageStats();
    const incrementScans = useIncrementDailyScans();
    const navigate = useNavigate();
    const isAuthenticated = !!identity;

    const dailyScans = usageStats ? Number(usageStats.dailyScans) : 0;
    const scansRemaining = isPro ? 'Unlimited' : Math.max(0, 10 - dailyScans);
    const limitReached = !isPro && dailyScans >= 10;

    const handleScan = async () => {
        if (!isAuthenticated) {
            toast.error('Login to scan');
            return;
        }

        if (limitReached) {
            toast.error('Scan limit hit. Punch through to Pro for unlimited.');
            return;
        }

        if (!scanText.trim()) {
            toast.error('Enter text to scan');
            return;
        }

        setIsScanning(true);
        try {
            // Simulate scan analysis
            await new Promise((resolve) => setTimeout(resolve, 1500));
            
            // Increment scan count
            if (!isPro) {
                await incrementScans.mutateAsync();
            }

            setScanResult('Scan complete. No filters. No games. Analysis shows raw truth.');
            toast.success('Scan complete');
        } catch (error) {
            toast.error('Scan failed');
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="min-h-screen p-8 pt-24">
            <div className="container max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-bold text-primary blood-glow mb-4 font-display">
                        Scan a Convo or Profile
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Scans left: <span className="text-primary font-bold">{scansRemaining}</span>
                        {!isPro && '/10'}
                    </p>
                </div>

                {limitReached && (
                    <Alert className="mb-6 border-accent bg-accent/10">
                        <AlertTriangle className="h-5 w-5 text-accent" />
                        <AlertDescription className="text-accent">
                            <div className="flex items-center justify-between">
                                <span className="font-bold">Scan Limit Reached – Upgrade to Pro for Unlimited</span>
                                <Button
                                    onClick={() => navigate({ to: '/upgrade' })}
                                    variant="outline"
                                    className="border-accent text-accent hover:bg-accent/20"
                                >
                                    Upgrade Now
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                <Card className="dragon-scales border-primary/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <ScanLine className="h-6 w-6" />
                            Text Scanner
                        </CardTitle>
                        <CardDescription>
                            Punch through the bullshit. Paste text to analyze.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Paste conversation or profile text here..."
                            value={scanText}
                            onChange={(e) => setScanText(e.target.value)}
                            className="min-h-[200px] bg-background/50 border-primary/30"
                            disabled={limitReached}
                        />
                        
                        <Button
                            onClick={handleScan}
                            disabled={isScanning || !scanText.trim() || limitReached}
                            className="w-full h-14 text-lg font-bold forged-metal border-2 border-primary hover:shadow-blood"
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Scanning...
                                </>
                            ) : (
                                'SCAN NOW'
                            )}
                        </Button>

                        {scanResult && (
                            <Alert className="border-primary/30 bg-primary/5">
                                <AlertDescription className="text-foreground">
                                    {scanResult}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
