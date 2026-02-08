import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Wifi, WifiOff, Trash2, Lock, Key, Crown, CreditCard, ExternalLink, CheckCircle2, XCircle, Shield, User, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';
import { firebaseService } from '../lib/firebase';
import { geminiService } from '../lib/geminiService';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import ApiKeyModal from './ApiKeyModal';
import ProAccessUpgrade from './ProAccessUpgrade';
import AdminDashboard from './AdminDashboard';

export default function SettingsPanel() {
    const { settings, updateSettings, clearHistory, history, geminiApiKey, isPro, subscriptionInfo } = useApp();
    const { identity, login, clear, loginStatus } = useInternetIdentity();
    const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    
    const isFirebaseAvailable = firebaseService.isAvailable();
    const isGeminiConfigured = geminiService.isConfigured();
    const isAuthenticated = !!identity;
    const isLoggingIn = loginStatus === 'logging-in';

    // Reinitialize Gemini service when API key changes
    useEffect(() => {
        if (geminiApiKey) {
            geminiService.setApiKey(geminiApiKey);
        }
    }, [geminiApiKey]);

    const handleModeChange = (mode: 'paranoid' | 'balanced' | 'vent') => {
        updateSettings({ mode });
        toast.success(`Analysis mode changed to ${mode}`);
    };

    const handleDebounceChange = (value: number[]) => {
        updateSettings({ debounceMs: value[0] });
    };

    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear all analysis history? This action cannot be undone.')) {
            clearHistory();
            toast.success('Analysis history cleared');
            
            if ('vibrate' in navigator) {
                navigator.vibrate(100);
            }
        }
    };

    const handleLogin = async () => {
        try {
            await login();
            toast.success('Successfully logged in with Internet Identity');
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.message === 'User is already authenticated') {
                await clear();
                setTimeout(() => login(), 300);
            } else {
                toast.error('Failed to log in. Please try again.');
            }
        }
    };

    const handleLogout = async () => {
        await clear();
        toast.success('Successfully logged out');
    };

    const handleNavigateToAdmin = () => {
        setActiveTab('admin');
    };

    const getSubscriptionStatusLabel = () => {
        if (subscriptionInfo.status === 'proMonthly') return 'Pro Monthly';
        if (subscriptionInfo.status === 'proAnnual') return 'Pro Annual';
        return 'Free';
    };

    return (
        <>
            <Card className="border-primary/30 bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <Settings className="h-5 w-5 text-primary" />
                        <span className="font-mono uppercase tracking-wider">System Configuration</span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Configure analysis sensitivity, subscription, and system behavior
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="subscription">
                                <Crown className="mr-2 h-4 w-4" />
                                Pro Access
                            </TabsTrigger>
                            {isAdmin && (
                                <TabsTrigger value="admin">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Admin
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="general" className="space-y-6 mt-6">
                            {/* Authentication Status Banner */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium font-mono uppercase tracking-wider">Authentication Status</Label>
                                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/50 p-3">
                                    <div className="flex items-center gap-2">
                                        {isAuthenticated ? (
                                            <>
                                                <User className="h-4 w-4 text-primary" />
                                                <div>
                                                    <p className="text-sm font-medium">Logged In</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {identity.getPrincipal().toString().slice(0, 20)}...
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Not Logged In</p>
                                                    <p className="text-xs text-muted-foreground">Sign in for Pro Access</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {isAuthenticated ? (
                                        <Button
                                            onClick={handleLogout}
                                            variant="outline"
                                            size="sm"
                                            className="border-primary/30"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleLogin}
                                            disabled={isLoggingIn}
                                            variant="outline"
                                            size="sm"
                                            className="border-primary/30"
                                        >
                                            {isLoggingIn ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Signing in...
                                                </>
                                            ) : (
                                                <>
                                                    <LogIn className="mr-2 h-4 w-4" />
                                                    Sign In
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Subscription Status Banner */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium font-mono uppercase tracking-wider">Subscription Status</Label>
                                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/50 p-3">
                                    <div className="flex items-center gap-2">
                                        {isPro ? (
                                            <>
                                                <Crown className="h-4 w-4 text-primary" />
                                                <div>
                                                    <p className="text-sm font-medium">{getSubscriptionStatusLabel()}</p>
                                                    <p className="text-xs text-muted-foreground">All premium features unlocked</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Free Tier</p>
                                                    <p className="text-xs text-muted-foreground">Limited features</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => setActiveTab('subscription')}
                                        variant="outline"
                                        size="sm"
                                        className="border-primary/30"
                                    >
                                        {isPro ? 'Manage' : 'Upgrade'}
                                    </Button>
                                </div>
                            </div>

                            {/* Enhanced Gemini API Key Section - Always Accessible */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium font-mono uppercase tracking-wider">Gemini API Key</Label>
                                
                                {/* Connection Status Display */}
                                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/50 p-3">
                                    <div className="flex items-center gap-2">
                                        {isGeminiConfigured ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                <div>
                                                    <p className="text-sm font-medium flex items-center gap-2">
                                                        Connected
                                                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs">
                                                            ✅
                                                        </Badge>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {isPro ? 'API key configured and ready' : 'Upgrade to Pro to use chat'}
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium flex items-center gap-2">
                                                        Not Connected
                                                        <Badge variant="outline" className="border-muted/30 text-xs">
                                                            ❌
                                                        </Badge>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">No API key configured</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {/* Button is always enabled for API key configuration */}
                                    <Button
                                        onClick={() => setShowApiKeyModal(true)}
                                        variant="outline"
                                        size="sm"
                                        className="border-primary/30"
                                    >
                                        <Key className="mr-2 h-4 w-4" />
                                        Configure API Key
                                    </Button>
                                </div>

                                {/* Inline Instructions */}
                                <Alert className="border-primary/20 bg-primary/5">
                                    <Lock className="h-4 w-4 text-primary" />
                                    <AlertDescription className="text-xs space-y-2">
                                        <p className="font-semibold text-foreground">How to get your Gemini API key:</p>
                                        <ol className="list-decimal list-inside space-y-1 ml-2 text-muted-foreground">
                                            <li>Visit Google AI Studio to generate a new API key</li>
                                            <li>Sign in with your Google account</li>
                                            <li>Click "Get API Key" and copy your key (starts with "AIza")</li>
                                            <li>Click "Configure API Key" above to add it</li>
                                        </ol>
                                        <a
                                            href="https://makersuite.google.com/app/apikey"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-primary hover:underline font-medium mt-2"
                                        >
                                            Generate Gemini API Key
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </AlertDescription>
                                </Alert>

                                {/* Status Information */}
                                <p className="text-xs text-muted-foreground">
                                    {!isPro 
                                        ? '🔒 You can configure your API key now, but you need to upgrade to Pro Access to use Gemini AI chat functionality.'
                                        : isGeminiConfigured
                                            ? '✅ Your API key is stored securely in your browser. Chat interface is now enabled and ready to use.'
                                            : '⚠️ Add your Gemini API key to enable enhanced chat functionality with AI responses.'
                                    }
                                </p>
                            </div>

                            {/* Firebase Status */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium font-mono uppercase tracking-wider">Cloud Connection Status</Label>
                                <div className="flex items-center gap-2">
                                    {isFirebaseAvailable ? (
                                        <>
                                            <Wifi className="h-4 w-4 text-primary" />
                                            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                                                Connected
                                            </Badge>
                                        </>
                                    ) : (
                                        <>
                                            <WifiOff className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="outline" className="border-muted/30">
                                                Offline Mode
                                            </Badge>
                                        </>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {isFirebaseAvailable
                                        ? 'Cloud features enabled. Chat history synced to Firebase.'
                                        : 'Operating in offline mode. All data stored locally in your browser.'}
                                </p>
                            </div>

                            {/* Analysis Mode */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium font-mono uppercase tracking-wider">Analysis Mode</Label>
                                <Select value={settings.mode} onValueChange={handleModeChange}>
                                    <SelectTrigger className="border-primary/30 bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="paranoid">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-destructive" />
                                                <span>Paranoid - Maximum Security</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="balanced">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-primary" />
                                                <span>Balanced - Recommended</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="vent">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                                <span>Vent - Minimal Filtering</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {settings.mode === 'paranoid' && 'Maximum threat detection. Flags even minor concerns.'}
                                    {settings.mode === 'balanced' && 'Balanced approach. Recommended for most users.'}
                                    {settings.mode === 'vent' && 'Minimal filtering. Best for casual venting.'}
                                </p>
                            </div>

                            {/* Debounce Delay */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium font-mono uppercase tracking-wider">
                                    Analysis Delay: {settings.debounceMs}ms
                                </Label>
                                <Slider
                                    value={[settings.debounceMs]}
                                    onValueChange={handleDebounceChange}
                                    min={100}
                                    max={2000}
                                    step={100}
                                    className="py-4"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Time to wait after typing stops before analyzing. Lower = faster, higher = less CPU usage.
                                </p>
                            </div>

                            {/* Clear History */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium font-mono uppercase tracking-wider">Data Management</Label>
                                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/50 p-3">
                                    <div>
                                        <p className="text-sm font-medium">Analysis History</p>
                                        <p className="text-xs text-muted-foreground">
                                            {history.length} {history.length === 1 ? 'entry' : 'entries'} stored locally
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleClearHistory}
                                        variant="outline"
                                        size="sm"
                                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                                        disabled={history.length === 0}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Clear History
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="subscription" className="mt-6">
                            <ProAccessUpgrade onNavigateToAdmin={isAdmin ? handleNavigateToAdmin : undefined} />
                        </TabsContent>

                        {isAdmin && (
                            <TabsContent value="admin" className="mt-6">
                                <AdminDashboard />
                            </TabsContent>
                        )}
                    </Tabs>
                </CardContent>
            </Card>

            {showApiKeyModal && (
                <ApiKeyModal
                    open={showApiKeyModal}
                    onOpenChange={setShowApiKeyModal}
                />
            )}
        </>
    );
}
