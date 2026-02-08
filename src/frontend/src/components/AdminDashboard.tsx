import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, CheckCircle2, AlertTriangle, Loader2, Lock, Unlock, Info, ExternalLink, RefreshCw } from 'lucide-react';
import { useSetStripeConfiguration, useIsStripeConfigured } from '../hooks/useQueries';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';
import type { StripeConfiguration } from '../backend';

export default function AdminDashboard() {
    const { setStripePublishableKey } = useApp();
    const [publishableKey, setPublishableKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [allowedCountries, setAllowedCountries] = useState('US,CA,GB');
    const [validationErrors, setValidationErrors] = useState<{ 
        publishable?: string; 
        secret?: string; 
        countries?: string 
    }>({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);

    const setStripeConfig = useSetStripeConfiguration();
    const { data: configStatus, isLoading: statusLoading, refetch: refetchStatus } = useIsStripeConfigured();

    const isConfigured = configStatus === true;

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

    const handleSaveAndActivate = async () => {
        setLastError(null);
        
        const isPubValid = validatePublishableKey(publishableKey);
        const isSecValid = validateSecretKey(secretKey);
        const isCountriesValid = validateCountries(allowedCountries);

        if (!isPubValid || !isSecValid || !isCountriesValid) {
            toast.error('Please fix all validation errors before saving');
            return;
        }

        // Verify both keys are from the same environment
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
            // Save secret key to backend
            await setStripeConfig.mutateAsync(config);
            
            // Save publishable key to frontend context/localStorage
            setStripePublishableKey(publishableKey);
            
            setShowSuccess(true);
            toast.success('Stripe Configuration Activated ✅', {
                description: 'Payment processing is now enabled for Pro Access subscriptions',
            });
            
            // Refetch status to update UI
            await refetchStatus();
            
            // Clear form
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

    const handleRetry = () => {
        setLastError(null);
        handleSaveAndActivate();
    };

    const hasValidationErrors = Object.values(validationErrors).some((error) => error !== undefined);
    const isFormComplete = publishableKey.trim() && secretKey.trim() && allowedCountries.trim();

    return (
        <div className="space-y-6">
            {/* Real-time Stripe Status Panel */}
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
                    {/* Status Details */}
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

                        {/* Key Status Indicators */}
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

                    {/* Security Note */}
                    <Alert className="border-primary/20 bg-primary/5">
                        <Shield className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-xs">
                            <strong className="text-primary">Security:</strong> Secret key is encrypted and stored in the backend canister. 
                            Publishable key is stored locally in browser. All payment processing happens securely through Stripe with end-to-end encryption.
                        </AlertDescription>
                    </Alert>

                    {/* Help Link */}
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

            {/* Configuration Form */}
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
                    {/* Admin Security Notice */}
                    <Alert className="border-primary/20 bg-primary/5">
                        <Lock className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-xs">
                            <strong className="text-primary">Admin Only Access:</strong> This configuration panel is restricted to administrators. 
                            Secret key is stored encrypted in the backend canister. Publishable key is stored in browser localStorage for checkout.
                        </AlertDescription>
                    </Alert>

                    {/* Success Message */}
                    {showSuccess && (
                        <Alert className="border-primary/30 bg-primary/10 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <AlertDescription className="text-sm font-medium text-primary">
                                ✅ Stripe Configuration Activated - Pro Access payments are now enabled
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message with Retry */}
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

                    {/* Step 1: Publishable Key */}
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
                            value={publishableKey}
                            onChange={(e) => handlePublishableKeyChange(e.target.value)}
                            placeholder="pk_test_... or pk_live_..."
                            className="font-mono text-sm border-primary/30 bg-background/50"
                        />
                        {validationErrors.publishable && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {validationErrors.publishable}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Used in the browser for checkout. Starts with <code className="text-primary">pk_test_</code> or <code className="text-primary">pk_live_</code>
                        </p>
                    </div>

                    {/* Step 2: Secret Key */}
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
                            value={secretKey}
                            onChange={(e) => handleSecretKeyChange(e.target.value)}
                            placeholder="sk_test_... or sk_live_..."
                            className="font-mono text-sm border-primary/30 bg-background/50"
                            autoComplete="off"
                        />
                        {validationErrors.secret && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {validationErrors.secret}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Stored encrypted in backend. Starts with <code className="text-primary">sk_test_</code> or <code className="text-primary">sk_live_</code>
                        </p>
                    </div>

                    {/* Step 3: Allowed Countries */}
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
                            value={allowedCountries}
                            onChange={(e) => handleCountriesChange(e.target.value)}
                            placeholder="US,CA,GB,AU,DE,FR"
                            className="font-mono text-sm border-primary/30 bg-background/50"
                        />
                        {validationErrors.countries && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {validationErrors.countries}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Comma-separated ISO country codes (e.g., US, CA, GB). Payments will only be accepted from these countries.
                        </p>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                        <Button
                            onClick={handleSaveAndActivate}
                            disabled={!isFormComplete || hasValidationErrors || setStripeConfig.isPending}
                            className="w-full bg-primary hover:bg-primary/90"
                            size="lg"
                        >
                            {setStripeConfig.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Activating Configuration...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    Save and Activate Stripe
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Help Section */}
                    <Alert className="border-primary/20 bg-primary/5">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-xs space-y-2">
                            <p className="font-semibold text-foreground">Where to find your Stripe keys:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-2 text-muted-foreground">
                                <li>Log in to your Stripe Dashboard</li>
                                <li>Navigate to Developers → API keys</li>
                                <li>Copy both the Publishable key and Secret key</li>
                                <li>Use test keys (pk_test_/sk_test_) for testing</li>
                                <li>Switch to live keys (pk_live_/sk_live_) for production</li>
                            </ol>
                            <a
                                href="https://dashboard.stripe.com/apikeys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline font-medium mt-2"
                            >
                                Open Stripe Dashboard
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    );
}
