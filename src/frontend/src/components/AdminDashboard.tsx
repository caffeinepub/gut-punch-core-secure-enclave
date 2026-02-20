import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield, Key, CheckCircle2, AlertTriangle, Loader2, Lock, Unlock, Info, ExternalLink, RefreshCw, Store, Wallet, DollarSign } from 'lucide-react';
import { useSetStripeConfiguration, useIsStripeConfigured, useGetMarketConfig, useUpdateMarketConfig } from '../hooks/useQueries';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';
import { validatePrincipalId } from '../lib/validation';
import type { StripeConfiguration, MarketConfig, MarketCategory, PayoutCurrency } from '../backend';
import MarketPublishingStatus from './MarketPublishingStatus';

export default function AdminDashboard() {
    const { setStripePublishableKey } = useApp();
    
    // Stripe state
    const [publishableKey, setPublishableKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [allowedCountries, setAllowedCountries] = useState('US,CA,GB');
    const [validationErrors, setValidationErrors] = useState<{ 
        publishable?: string; 
        secret?: string; 
        countries?: string;
        walletPrincipal?: string;
    }>({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);

    // Market config state
    const [priceUSD, setPriceUSD] = useState('0');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<MarketCategory>('other' as MarketCategory);
    const [walletPrincipal, setWalletPrincipal] = useState('');
    const [payoutCurrency, setPayoutCurrency] = useState<PayoutCurrency>('usdc' as PayoutCurrency);

    const setStripeConfig = useSetStripeConfiguration();
    const { data: configStatus, isLoading: statusLoading, refetch: refetchStatus } = useIsStripeConfigured();
    const { data: marketConfig, isLoading: marketConfigLoading } = useGetMarketConfig();
    const updateMarketConfig = useUpdateMarketConfig();

    const isConfigured = configStatus === true;

    // Load market config when available
    useEffect(() => {
        if (marketConfig) {
            setPriceUSD(marketConfig.priceUSD.toString());
            setDescription(marketConfig.description);
            setCategory(marketConfig.category);
            setWalletPrincipal(marketConfig.walletPrincipal?.toString() || '');
            setPayoutCurrency(marketConfig.payoutCurrency);
        }
    }, [marketConfig]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const validatePublishableKey = (key: string): boolean => {
        if (!key.trim()) {
            setValidationErrors((prev) => ({ ...prev, publishable: 'Publishable key is required' }));
            return false;
        }
        if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) {
            setValidationErrors((prev) => ({ ...prev, publishable: 'Must start with pk_test_ or pk_live_' }));
            return false;
        }
        if (key.length < 20) {
            setValidationErrors((prev) => ({ ...prev, publishable: 'Key appears too short (minimum 20 characters)' }));
            return false;
        }
        setValidationErrors((prev) => ({ ...prev, publishable: undefined }));
        return true;
    };

    const validateSecretKey = (key: string): boolean => {
        if (!key.trim()) {
            setValidationErrors((prev) => ({ ...prev, secret: 'Secret key is required' }));
            return false;
        }
        if (!key.startsWith('sk_test_') && !key.startsWith('sk_live_')) {
            setValidationErrors((prev) => ({ ...prev, secret: 'Must start with sk_test_ or sk_live_' }));
            return false;
        }
        if (key.length < 20) {
            setValidationErrors((prev) => ({ ...prev, secret: 'Key appears too short (minimum 20 characters)' }));
            return false;
        }
        setValidationErrors((prev) => ({ ...prev, secret: undefined }));
        return true;
    };

    const validateCountries = (countries: string): boolean => {
        const parsed = countries
            .split(',')
            .map((c) => c.trim().toUpperCase())
            .filter((c) => c.length === 2);

        if (parsed.length === 0) {
            setValidationErrors((prev) => ({ ...prev, countries: 'At least one valid country code required' }));
            return false;
        }
        setValidationErrors((prev) => ({ ...prev, countries: undefined }));
        return true;
    };

    const validateWalletPrincipal = (principal: string): boolean => {
        if (!principal.trim()) {
            setValidationErrors((prev) => ({ ...prev, walletPrincipal: undefined }));
            return true; // Optional field
        }
        
        if (!validatePrincipalId(principal)) {
            setValidationErrors((prev) => ({ ...prev, walletPrincipal: 'Invalid principal ID format' }));
            return false;
        }
        
        setValidationErrors((prev) => ({ ...prev, walletPrincipal: undefined }));
        return true;
    };

    const handlePublishableKeyChange = (value: string) => {
        setPublishableKey(value);
        setLastError(null);
        if (value) validatePublishableKey(value);
    };

    const handleSecretKeyChange = (value: string) => {
        setSecretKey(value);
        setLastError(null);
        if (value) validateSecretKey(value);
    };

    const handleCountriesChange = (value: string) => {
        setAllowedCountries(value);
        setLastError(null);
        if (value) validateCountries(value);
    };

    const handleWalletPrincipalChange = (value: string) => {
        setWalletPrincipal(value);
        if (value) validateWalletPrincipal(value);
    };

    const handleSaveAndActivate = async () => {
        setLastError(null);
        
        const isPubValid = validatePublishableKey(publishableKey);
        const isSecValid = validateSecretKey(secretKey);
        const isCountriesValid = validateCountries(allowedCountries);

        if (!isPubValid || !isSecValid || !isCountriesValid) {
            toast.error('Please fix all validation errors before saving');
            return;
        }

        const pubIsTest = publishableKey.startsWith('pk_test_');
        const secIsTest = secretKey.startsWith('sk_test_');
        
        if (pubIsTest !== secIsTest) {
            setLastError('Publishable and secret keys must be from the same environment (both test or both live)');
            toast.error('Key environment mismatch');
            return;
        }

        const countries = allowedCountries
            .split(',')
            .map((c) => c.trim().toUpperCase())
            .filter((c) => c.length === 2);

        const config: StripeConfiguration = {
            secretKey,
            allowedCountries: countries,
        };

        try {
            await setStripeConfig.mutateAsync(config);
            setStripePublishableKey(publishableKey);
            setShowSuccess(true);
            toast.success('Stripe Configuration Activated ✅', {
                description: 'Payment processing is now enabled for Pro Access subscriptions',
            });
            await refetchStatus();
            setPublishableKey('');
            setSecretKey('');
            
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100]);
            }
        } catch (error: any) {
            console.error('Failed to save Stripe configuration:', error);
            
            let errorMessage = 'Failed to activate Stripe configuration';
            
            if (error.message?.includes('Unauthorized') || error.message?.includes('permission')) {
                errorMessage = 'Permission denied: Only administrators can configure Stripe';
            } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                errorMessage = 'Network error: Please check your connection and try again';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setLastError(errorMessage);
            toast.error('Configuration Failed', {
                description: errorMessage,
            });
        }
    };

    const handleSaveMarketConfig = async () => {
        const isWalletValid = validateWalletPrincipal(walletPrincipal);
        
        if (!isWalletValid) {
            toast.error('Please fix validation errors before saving');
            return;
        }

        if (!marketConfig) {
            toast.error('Market configuration not loaded');
            return;
        }

        const price = parseInt(priceUSD, 10);
        if (isNaN(price) || price < 0) {
            toast.error('Invalid price value');
            return;
        }

        try {
            // Import Principal for conversion
            const { Principal } = await import('@dfinity/principal');
            
            const config: MarketConfig = {
                priceUSD: BigInt(price),
                description,
                category,
                walletPrincipal: walletPrincipal.trim() ? Principal.fromText(walletPrincipal.trim()) : undefined,
                payoutCurrency,
                isPublished: marketConfig.isPublished,
                totalRoyaltiesEarned: marketConfig.totalRoyaltiesEarned,
            };

            await updateMarketConfig.mutateAsync(config);
            toast.success('Market Configuration Saved ✅', {
                description: 'Your marketplace settings have been updated',
            });
        } catch (error: any) {
            console.error('Failed to save market configuration:', error);
            toast.error('Configuration Failed', {
                description: error.message || 'Failed to save market configuration',
            });
        }
    };

    const handleRetry = () => {
        setLastError(null);
        handleSaveAndActivate();
    };

    const hasValidationErrors = Object.values(validationErrors).some((error) => error !== undefined);
    const isFormComplete = publishableKey.trim() && secretKey.trim() && allowedCountries.trim();

    return (
        <Tabs defaultValue="stripe" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stripe" className="font-mono">
                    <Shield className="mr-2 h-4 w-4" />
                    Stripe Payments
                </TabsTrigger>
                <TabsTrigger value="market" className="font-mono">
                    <Store className="mr-2 h-4 w-4" />
                    App Market
                </TabsTrigger>
            </TabsList>

            {/* Stripe Configuration Tab */}
            <TabsContent value="stripe" className="space-y-6">
                {/* Stripe Status Panel */}
                <Card className="border-primary/30 bg-gradient-to-br from-background/80 to-background/50 shadow-lg shadow-primary/5">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isConfigured ? 'bg-primary/20' : 'bg-yellow-500/20'}`}>
                                    {isConfigured ? (
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                    ) : (
                                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="font-mono uppercase tracking-wider text-foreground text-lg">
                                        Stripe Payment Status
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                        Real-time configuration monitoring
                                    </CardDescription>
                                </div>
                            </div>
                            {statusLoading ? (
                                <Badge variant="outline" className="font-mono">
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    Checking...
                                </Badge>
                            ) : isConfigured ? (
                                <Badge className="bg-primary/20 text-primary border-primary/50 font-mono shadow-lg shadow-primary/20 animate-pulse">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Active ✅
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 font-mono">
                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                    Not Configured
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-primary/10">
                                <div className="mt-0.5">
                                    {isConfigured ? (
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                    ) : (
                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        {isConfigured ? 'Payment System Active' : 'Configuration Required'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {isConfigured 
                                            ? 'Stripe keys are configured and validated. Payment processing is enabled for allowed countries. Pro Access subscriptions are now available.'
                                            : 'Stripe keys have not been configured. Complete the setup below to enable payment processing and activate Pro Access subscriptions.'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Unlock className="h-3 w-3 text-muted-foreground" />
                                        <p className="text-xs font-medium text-foreground">Publishable Key</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {isConfigured ? 'Configured ✓' : 'Not Set'}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Lock className="h-3 w-3 text-muted-foreground" />
                                        <p className="text-xs font-medium text-foreground">Secret Key</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {isConfigured ? 'Configured ✓' : 'Not Set'}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Key className="h-3 w-3 text-muted-foreground" />
                                        <p className="text-xs font-medium text-foreground">Countries</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {isConfigured ? 'Configured ✓' : 'Not Set'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Alert className="border-primary/20 bg-primary/5">
                            <Shield className="h-4 w-4 text-primary" />
                            <AlertDescription className="text-xs">
                                <strong className="text-primary">Security:</strong> Secret key is encrypted and stored in the backend canister. 
                                Publishable key is stored locally in browser. All payment processing happens securely through Stripe with end-to-end encryption.
                            </AlertDescription>
                        </Alert>

                        {!isConfigured && (
                            <div className="flex items-center justify-center pt-2">
                                <a
                                    href="https://stripe.com/docs/keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium"
                                >
                                    <Info className="h-3 w-3" />
                                    Need Help? View Setup Guide
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stripe Configuration Form */}
                <Card className="border-primary/30 bg-card/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <CardTitle className="font-mono uppercase tracking-wider text-foreground">
                                Payment System Configuration
                            </CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground">
                            Configure Stripe payment integration for Pro Access subscriptions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert className="border-primary/20 bg-primary/5">
                            <Lock className="h-4 w-4 text-primary" />
                            <AlertDescription className="text-xs">
                                <strong className="text-primary">Admin Only Access:</strong> This configuration panel is restricted to administrators. 
                                Secret key is stored encrypted in the backend canister. Publishable key is stored in browser localStorage for checkout.
                            </AlertDescription>
                        </Alert>

                        {showSuccess && (
                            <Alert className="border-primary/30 bg-primary/10 animate-in fade-in slide-in-from-top-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <AlertDescription className="text-sm font-medium text-primary">
                                    ✅ Stripe Configuration Activated - Pro Access payments are now enabled
                                </AlertDescription>
                            </Alert>
                        )}

                        {lastError && (
                            <Alert className="border-destructive/30 bg-destructive/10 animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                <AlertDescription className="space-y-2">
                                    <p className="text-sm font-medium text-destructive">{lastError}</p>
                                    <Button
                                        onClick={handleRetry}
                                        variant="outline"
                                        size="sm"
                                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                                        disabled={setStripeConfig.isPending}
                                    >
                                        <RefreshCw className="mr-2 h-3 w-3" />
                                        Retry Configuration
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                    1
                                </div>
                                <Label htmlFor="publishable-key" className="text-sm font-medium font-mono uppercase tracking-wider">
                                    Stripe Publishable Key
                                </Label>
                            </div>
                            <Input
                                id="publishable-key"
                                type="text"
                                placeholder="pk_test_... or pk_live_..."
                                value={publishableKey}
                                onChange={(e) => handlePublishableKeyChange(e.target.value)}
                                className={`font-mono text-xs ${validationErrors.publishable ? 'border-destructive' : ''}`}
                            />
                            {validationErrors.publishable && (
                                <p className="text-xs text-destructive">{validationErrors.publishable}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                    2
                                </div>
                                <Label htmlFor="secret-key" className="text-sm font-medium font-mono uppercase tracking-wider">
                                    Stripe Secret Key
                                </Label>
                            </div>
                            <Input
                                id="secret-key"
                                type="password"
                                placeholder="sk_test_... or sk_live_..."
                                value={secretKey}
                                onChange={(e) => handleSecretKeyChange(e.target.value)}
                                className={`font-mono text-xs ${validationErrors.secret ? 'border-destructive' : ''}`}
                            />
                            {validationErrors.secret && (
                                <p className="text-xs text-destructive">{validationErrors.secret}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                    3
                                </div>
                                <Label htmlFor="countries" className="text-sm font-medium font-mono uppercase tracking-wider">
                                    Allowed Countries
                                </Label>
                            </div>
                            <Input
                                id="countries"
                                type="text"
                                placeholder="US,CA,GB"
                                value={allowedCountries}
                                onChange={(e) => handleCountriesChange(e.target.value)}
                                className={`font-mono text-xs ${validationErrors.countries ? 'border-destructive' : ''}`}
                            />
                            {validationErrors.countries && (
                                <p className="text-xs text-destructive">{validationErrors.countries}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Comma-separated ISO country codes (e.g., US,CA,GB,AU)
                            </p>
                        </div>

                        <Button
                            onClick={handleSaveAndActivate}
                            disabled={!isFormComplete || hasValidationErrors || setStripeConfig.isPending}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono"
                        >
                            {setStripeConfig.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Activating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Save & Activate Stripe
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* App Market Configuration Tab */}
            <TabsContent value="market" className="space-y-6">
                {/* Market Publishing Status */}
                <MarketPublishingStatus />

                {/* Market Configuration Form */}
                <Card className="border-primary/30 bg-card/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-primary" />
                            <CardTitle className="font-mono uppercase tracking-wider text-foreground">
                                Marketplace Listing
                            </CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground">
                            Configure your app's listing on the Caffeine App Market
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {marketConfigLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    <Label htmlFor="price" className="text-sm font-medium font-mono uppercase tracking-wider">
                                        Clone Price (USD)
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={priceUSD}
                                            onChange={(e) => setPriceUSD(e.target.value)}
                                            className="font-mono pl-10"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Set to 0 for free clones. Users pay this amount to deploy your app live.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="description" className="text-sm font-medium font-mono uppercase tracking-wider">
                                        Marketplace Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe your app for the marketplace..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This description will appear on your app's marketplace listing.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="category" className="text-sm font-medium font-mono uppercase tracking-wider">
                                        Category
                                    </Label>
                                    <Select value={category} onValueChange={(value) => setCategory(value as MarketCategory)}>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="productivity">Productivity</SelectItem>
                                            <SelectItem value="finance">Finance</SelectItem>
                                            <SelectItem value="education">Education</SelectItem>
                                            <SelectItem value="health">Health</SelectItem>
                                            <SelectItem value="entertainment">Entertainment</SelectItem>
                                            <SelectItem value="utility">Utility</SelectItem>
                                            <SelectItem value="business">Business</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    onClick={handleSaveMarketConfig}
                                    disabled={updateMarketConfig.isPending}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono"
                                >
                                    {updateMarketConfig.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Save Listing Settings
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Wallet Configuration */}
                <Card className="border-primary/30 bg-card/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            <CardTitle className="font-mono uppercase tracking-wider text-foreground">
                                OISY Wallet Configuration
                            </CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground">
                            Connect your OISY wallet to receive royalty payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {marketConfigLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                <Alert className="border-primary/20 bg-primary/5">
                                    <Info className="h-4 w-4 text-primary" />
                                    <AlertDescription className="text-xs space-y-2">
                                        <p>
                                            <strong className="text-primary">OISY Wallet:</strong> A crypto wallet for the Internet Computer. 
                                            Create one at{' '}
                                            <a
                                                href="https://oisy.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                oisy.com
                                            </a>
                                        </p>
                                        <p>
                                            Your wallet principal ID is used to receive royalty payments when users deploy your app.
                                        </p>
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-3">
                                    <Label htmlFor="wallet-principal" className="text-sm font-medium font-mono uppercase tracking-wider">
                                        Wallet Principal ID
                                    </Label>
                                    <Input
                                        id="wallet-principal"
                                        type="text"
                                        placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                                        value={walletPrincipal}
                                        onChange={(e) => handleWalletPrincipalChange(e.target.value)}
                                        className={`font-mono text-xs ${validationErrors.walletPrincipal ? 'border-destructive' : ''}`}
                                    />
                                    {validationErrors.walletPrincipal && (
                                        <p className="text-xs text-destructive">{validationErrors.walletPrincipal}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Your OISY wallet's principal ID (optional - required to receive payments)
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-medium font-mono uppercase tracking-wider">
                                        Payout Currency
                                    </Label>
                                    <RadioGroup value={payoutCurrency} onValueChange={(value) => setPayoutCurrency(value as PayoutCurrency)}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="usdc" id="usdc" />
                                            <Label htmlFor="usdc" className="font-normal cursor-pointer">
                                                USDC (US Dollar Stablecoin)
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="btc" id="btc" />
                                            <Label htmlFor="btc" className="font-normal cursor-pointer">
                                                Bitcoin (BTC)
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="icp" id="icp" />
                                            <Label htmlFor="icp" className="font-normal cursor-pointer">
                                                ICP (Internet Computer)
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    <p className="text-xs text-muted-foreground">
                                        Choose which cryptocurrency you want to receive for royalty payments
                                    </p>
                                </div>

                                <Button
                                    onClick={handleSaveMarketConfig}
                                    disabled={updateMarketConfig.isPending || !!validationErrors.walletPrincipal}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono"
                                >
                                    {updateMarketConfig.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Save Wallet Settings
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
