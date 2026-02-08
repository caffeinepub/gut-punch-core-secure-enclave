import { useState, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Copy, Shield, ShieldCheck, ChevronRight, MessageSquare, ScanEye, Terminal, Lock } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useApp, FREE_TIER_DAILY_LIMIT } from '../contexts/AppContext';
import { analyzeText } from '../lib/analyzer';
import { calculateMetrics, type Message } from '../lib/metrics';
import { useDebounce } from '../hooks/useDebounce';
import RiskMeter from './RiskMeter';
import MetricsPanel from './MetricsPanel';
import ChatInterface from './ChatInterface';
import ResolutionAudit from './ResolutionAudit';
import AlertList from './AlertList';
import HistoryVault from './HistoryVault';
import SettingsPanel from './SettingsPanel';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function MainAnalyzer() {
    const { settings, addToHistory, isPro, dailyScans, incrementDailyScans } = useApp();
    const [inputText, setInputText] = useState('');
    const [copied, setCopied] = useState(false);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [heuristicOpen, setHeuristicOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('safe-draft');
    const [scanBlocked, setScanBlocked] = useState(false);

    const debouncedText = useDebounce(inputText, settings.debounceMs);

    const { currentScore, currentTriggers } = useMemo(() => {
        if (!debouncedText.trim()) {
            return { currentScore: 0, currentTriggers: [] };
        }

        // Check scan limits for free tier
        if (!isPro && dailyScans >= FREE_TIER_DAILY_LIMIT) {
            setScanBlocked(true);
            return { currentScore: 0, currentTriggers: [] };
        }

        setScanBlocked(false);
        const { score, triggers } = analyzeText(debouncedText, settings.mode);

        if (triggers.length > 0) {
            addToHistory({
                id: `${Date.now()}-${Math.random()}`,
                timestamp: Date.now(),
                text: debouncedText.substring(0, 200),
                score,
                triggers,
                mode: settings.mode,
            });
            
            // Increment scan count for free tier
            if (!isPro) {
                incrementDailyScans();
            }
        }

        return { currentScore: score, currentTriggers: triggers };
    }, [debouncedText, settings.mode, addToHistory, isPro, dailyScans, incrementDailyScans]);

    const { uspScore, pesLoad } = useMemo(() => {
        return calculateMetrics(chatMessages);
    }, [chatMessages]);

    const isAnalyzing = inputText !== debouncedText;

    const handleClear = () => {
        if (inputText.trim()) {
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        }
        setInputText('');
        setScanBlocked(false);
        toast.success('Analysis cleared');
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inputText);
            setCopied(true);
            toast.success('Text copied securely');
            setTimeout(() => setCopied(false), 2000);
            
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        } catch (error) {
            toast.error('Failed to copy text');
        }
    };

    const handleMessagesUpdate = (messages: Message[]) => {
        setChatMessages(messages);
    };

    const threatCount = currentTriggers.length;
    const scansRemaining = isPro ? 'Unlimited' : Math.max(0, FREE_TIER_DAILY_LIMIT - dailyScans);

    return (
        <div className="container py-6 space-y-6">
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Scan Limit Warning */}
                {!isPro && dailyScans >= FREE_TIER_DAILY_LIMIT - 2 && (
                    <Alert className="border-chart-1/30 bg-chart-1/5">
                        <Lock className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>
                                {dailyScans >= FREE_TIER_DAILY_LIMIT 
                                    ? 'Daily scan limit reached. Upgrade to Pro for unlimited scans.'
                                    : `Only ${scansRemaining} scans remaining today. Upgrade to Pro for unlimited scans.`
                                }
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveTab('console')}
                            >
                                Upgrade
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Secure Enclave Status Header */}
                <Card className="border-primary/30 bg-card/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/30">
                                    <Shield className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Secure Enclave</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                                            Status: Local Heuristics Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/5">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary font-mono">{threatCount}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                            Threat
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                                    Scans: {scansRemaining}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Input Area */}
                <Card className="border-primary/30 bg-card/50">
                    <CardContent className="pt-6 space-y-4">
                        <div className="relative">
                            <Textarea
                                placeholder={
                                    scanBlocked 
                                        ? 'Daily scan limit reached. Upgrade to Pro for unlimited scans...'
                                        : 'Paste suspicious draft here... analysis stays local...'
                                }
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="min-h-[200px] resize-y font-mono text-sm bg-background/50 border-primary/20 focus:border-primary/50 focus:ring-primary/30 rounded-xl"
                                aria-label="Message input for analysis"
                                disabled={scanBlocked}
                            />
                            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                <Button
                                    onClick={handleClear}
                                    variant="ghost"
                                    size="icon"
                                    disabled={!inputText}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={handleCopy}
                                    variant="ghost"
                                    size="icon"
                                    disabled={!inputText}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                onClick={handleCopy}
                                disabled={!inputText}
                                className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-mono uppercase tracking-wider"
                            >
                                {copied ? 'Copied!' : 'Safe Copy'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Collapsible Heuristic Output */}
                <Collapsible open={heuristicOpen} onOpenChange={setHeuristicOpen}>
                    <Card className="border-primary/30 bg-card/50">
                        <CollapsibleTrigger className="w-full">
                            <CardContent className="pt-6 pb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ChevronRight 
                                            className={cn(
                                                "h-5 w-5 text-primary transition-transform",
                                                heuristicOpen && "rotate-90"
                                            )} 
                                        />
                                        <span className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                                            &gt;_ Heuristic Output
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="pt-0 pb-6 space-y-4">
                                {scanBlocked ? (
                                    <Alert className="border-destructive/30 bg-destructive/5">
                                        <Lock className="h-4 w-4" />
                                        <AlertDescription>
                                            You've reached your daily scan limit of {FREE_TIER_DAILY_LIMIT} scans. 
                                            Upgrade to Pro Access for unlimited scans and full features.
                                        </AlertDescription>
                                    </Alert>
                                ) : currentTriggers.length === 0 && inputText.trim() && !isAnalyzing ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30">
                                            <ShieldCheck className="h-10 w-10 text-primary" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h3 className="text-lg font-bold text-primary uppercase tracking-wider">
                                                Enclave Clear
                                            </h3>
                                            <p className="text-sm text-muted-foreground max-w-md">
                                                No suspicious patterns detected. Content appears safe based on local heuristic analysis.
                                            </p>
                                        </div>
                                    </div>
                                ) : currentTriggers.length > 0 ? (
                                    <div className="space-y-4">
                                        <RiskMeter score={currentScore} isAnalyzing={isAnalyzing} />
                                        <AlertList triggers={currentTriggers} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/10 border-2 border-muted/30">
                                            <Shield className="h-10 w-10 text-muted-foreground" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-wider">
                                                Awaiting Input
                                            </h3>
                                            <p className="text-sm text-muted-foreground max-w-md">
                                                Paste or type content above to begin local analysis.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* Bottom Navigation Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-card/50 border border-primary/20">
                        <TabsTrigger 
                            value="safe-draft" 
                            className={cn(
                                "flex flex-col items-center gap-2 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary",
                                activeTab === 'safe-draft' && "neon-glow"
                            )}
                        >
                            <Shield className="h-5 w-5" />
                            <span className="text-xs font-mono uppercase tracking-wider">Safe Draft</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="consultant" 
                            className={cn(
                                "flex flex-col items-center gap-2 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary",
                                activeTab === 'consultant' && "neon-glow"
                            )}
                        >
                            <MessageSquare className="h-5 w-5" />
                            <span className="text-xs font-mono uppercase tracking-wider">Consultant</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="scan-eye" 
                            className={cn(
                                "flex flex-col items-center gap-2 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary",
                                activeTab === 'scan-eye' && "neon-glow"
                            )}
                        >
                            <ScanEye className="h-5 w-5" />
                            <span className="text-xs font-mono uppercase tracking-wider">Scan Eye</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="console" 
                            className={cn(
                                "flex flex-col items-center gap-2 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary",
                                activeTab === 'console' && "neon-glow"
                            )}
                        >
                            <Terminal className="h-5 w-5" />
                            <span className="text-xs font-mono uppercase tracking-wider">Console</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="safe-draft" className="mt-6 space-y-6">
                        <Card className="border-primary/30 bg-card/50">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30 mx-auto">
                                        <Shield className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Safe Draft Mode Active</h3>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            All content analysis is performed locally. Use the input area above to analyze suspicious messages.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="consultant" className="mt-6 space-y-6">
                        {!isPro ? (
                            <Alert className="border-primary/30 bg-primary/5">
                                <Lock className="h-4 w-4" />
                                <AlertDescription className="flex items-center justify-between">
                                    <span>Upgrade to Pro Access to unlock Gemini AI chat functionality.</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActiveTab('console')}
                                    >
                                        Upgrade Now
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        ) : null}
                        <div className="grid gap-6 lg:grid-cols-2">
                            <ChatInterface onMessagesUpdate={handleMessagesUpdate} />
                            <MetricsPanel uspScore={uspScore} pesLoad={pesLoad} isPro={isPro} />
                        </div>
                    </TabsContent>

                    <TabsContent value="scan-eye" className="mt-6">
                        <ResolutionAudit 
                            messages={chatMessages}
                            uspScore={uspScore}
                            pesLoad={pesLoad}
                            isPro={isPro}
                        />
                    </TabsContent>

                    <TabsContent value="console" className="mt-6 space-y-6">
                        <HistoryVault />
                        <SettingsPanel />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
