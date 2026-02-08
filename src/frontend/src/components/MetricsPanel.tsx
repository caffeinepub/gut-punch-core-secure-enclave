import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Activity, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUSPLabel, getPESLabel } from '@/lib/metrics';

interface MetricsPanelProps {
    uspScore: number;
    pesLoad: number;
    isPro?: boolean;
}

export default function MetricsPanel({ uspScore, pesLoad, isPro = false }: MetricsPanelProps) {
    const uspLabel = getUSPLabel(uspScore);
    const pesLabel = getPESLabel(pesLoad);

    // Show basic metrics for free tier
    const displayUSP = isPro ? uspScore : Math.round(uspScore / 10) * 10;
    const displayPES = isPro ? pesLoad : Math.round(pesLoad / 10) * 10;

    const getUSPColorClass = (score: number) => {
        if (score >= 80) return '[&>div]:bg-chart-2';
        if (score >= 65) return '[&>div]:bg-chart-3';
        if (score >= 50) return '[&>div]:bg-chart-5';
        if (score >= 35) return '[&>div]:bg-chart-1';
        return '[&>div]:bg-destructive';
    };

    const getPESColorClass = (load: number) => {
        if (load >= 75) return '[&>div]:bg-destructive';
        if (load >= 50) return '[&>div]:bg-chart-1';
        if (load >= 25) return '[&>div]:bg-chart-5';
        return '[&>div]:bg-chart-2';
    };

    const getUSPTextColor = (score: number) => {
        if (score >= 80) return 'text-chart-2';
        if (score >= 65) return 'text-chart-3';
        if (score >= 50) return 'text-chart-5';
        if (score >= 35) return 'text-chart-1';
        return 'text-destructive';
    };

    const getPESTextColor = (load: number) => {
        if (load >= 75) return 'text-destructive';
        if (load >= 50) return 'text-chart-1';
        if (load >= 25) return 'text-chart-5';
        return 'text-chart-2';
    };

    return (
        <Card role="region" aria-label="USP/PES Metrics" className="border-primary/30 bg-card/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                    <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="font-mono uppercase tracking-wider">Resolution Metrics</span>
                    {!isPro && <Lock className="h-4 w-4 text-muted-foreground" />}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    {isPro 
                        ? 'Real-time analysis of emotional and psychological patterns'
                        : 'Basic metrics - Upgrade to Pro for full resolution'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!isPro && (
                    <Alert className="border-primary/30 bg-primary/5">
                        <Lock className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            Upgrade to Pro Access for full resolution metrics with detailed breakdowns and analysis.
                        </AlertDescription>
                    </Alert>
                )}

                {/* USP Score */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <span className="text-sm font-medium font-mono uppercase tracking-wider">USP</span>
                        </div>
                        <span 
                            className={cn('text-lg font-bold font-mono', getUSPTextColor(displayUSP))}
                            role="status"
                            aria-live="polite"
                            aria-label={`USP Score: ${displayUSP}, ${uspLabel}`}
                        >
                            {isPro ? uspLabel : 'Basic'}
                        </span>
                    </div>
                    <Progress 
                        value={displayUSP} 
                        className={cn('h-3', getUSPColorClass(displayUSP))}
                        aria-label={`USP progress: ${displayUSP} out of 100`}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                        <span>0</span>
                        <span>{displayUSP}/100</span>
                        <span>100</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Unconditional Self-Pride: Positive self-regard and emotional resilience
                    </p>
                </div>

                {/* PES Load */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <span className="text-sm font-medium font-mono uppercase tracking-wider">PES Load</span>
                        </div>
                        <span 
                            className={cn('text-lg font-bold font-mono', getPESTextColor(displayPES))}
                            role="status"
                            aria-live="polite"
                            aria-label={`PES Load: ${displayPES}, ${pesLabel}`}
                        >
                            {isPro ? pesLabel : 'Basic'}
                        </span>
                    </div>
                    <Progress 
                        value={displayPES} 
                        className={cn('h-3', getPESColorClass(displayPES))}
                        aria-label={`PES load progress: ${displayPES} out of 100`}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                        <span>0</span>
                        <span>{displayPES}/100</span>
                        <span>100</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Primal Energy System: Stress, threat response, and negative activation
                    </p>
                </div>

                {/* Interpretation */}
                <div 
                    className={cn(
                        'rounded-lg border p-3',
                        displayPES > 50 ? 'border-destructive/50 bg-destructive/5' : 'border-primary/30 bg-primary/5'
                    )}
                    role="note"
                >
                    <p className="text-xs">
                        {displayPES > 50 && (
                            <span className="font-semibold text-destructive">
                                ⚠️ Elevated stress indicators detected. Consider taking a break or seeking support.
                            </span>
                        )}
                        {displayPES <= 50 && displayUSP >= 65 && (
                            <span className="font-semibold text-primary">
                                ✓ Healthy emotional balance detected. Continue maintaining positive patterns.
                            </span>
                        )}
                        {displayPES <= 50 && displayUSP < 65 && (
                            <span className="font-semibold text-chart-5">
                                ℹ️ Moderate emotional state. Focus on self-care and positive reinforcement.
                            </span>
                        )}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
