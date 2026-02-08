import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Crown, Loader2, AlertCircle, Zap, Shield, MessageSquare, CheckCircle2, XCircle, LogIn, LogOut, User, Settings } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useCreateCheckoutSession, useIsStripeConfigured, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ShoppingItem } from '../backend';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        period: 'forever',
        features: [
            '10 scans per day',
            'Basic USP/PES metrics',
            'Local analysis only',
            'History vault (100 entries)',
        ],
        limitations: [
            'No Gemini chat',
            'Limited metrics resolution',
            'Daily scan quota',
        ],
    },
    {
        id: 'pro-monthly',
        name: 'Pro Monthly',
        price: '$9.99',
        period: 'per month',
        priceInCents: 999,
        productName: 'SecureDraft AI Pro Monthly',
        productDescription: 'Monthly subscription to SecureDraft AI Pro Access',
        features: [
            'Unlimited scans',
            'Full resolution metrics',
            'Gemini AI chat access',
            'Priority analysis',
            'Advanced threat detection',
            'Export capabilities',
        ],
        popular: true,
    },
    {
        id: 'pro-annual',
        name: 'Pro Annual',
        price: '$99.99',
        period: 'per year',
        priceInCents: 9999,
        productName: 'SecureDraft AI Pro Annual',
        productDescription: 'Annual subscription to SecureDraft AI Pro Access',
        savings: 'Save $20',
        features: [
            'All Pro Monthly features',
            'Annual billing discount',
            'Priority support',
            'Early access to new features',
        ],
    },
];

interface ProAccessUpgradeProps {
    onNavigateToAdmin?: () => void;
}

export default function ProAccessUpgrade({ onNavigateToAdmin }: ProAccessUpgradeProps) {
    const { isPro, subscriptionInfo, stripePublishableKey } = useApp();
    const { identity, login, clear, loginStatus } = useInternetIdentity();
    const { data: isStripeConfigured, isLoading: checkingStripe, error: stripeError } = useIsStripeConfigured();
    const { data: isAdmin } = useIsCallerAdmin();
    const createCheckoutSession = useCreateCheckoutSession();
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);

    const isAuthenticated = !!identity;
    const isLoggingIn = loginStatus === 'logging-in';
    const hasStripeKeys = isStripeConfigured && stripePublishableKey;

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

    const handleUpgrade = async (planId: string) => {
        if (!isAuthenticated) {
            toast.error('Please sign in with Internet Identity to upgrade to Pro Access');
            return;
        }

        if (!isStripeConfigured) {
            toast.error('Payments are currently unavailable. Please try again later.');
            return;
        }

        if (!stripePublishableKey) {
            toast.error('Payment system configuration incomplete. Please contact support.');
            return;
        }

        const plan = PLANS.find((p) => p.id === planId);
        if (!plan || !plan.priceInCents) return;

        setProcessingPlan(planId);

        try {
            const shoppingItem: ShoppingItem = {
                productName: plan.productName!,
                productDescription: plan.productDescription!,
                priceInCents: BigInt(plan.priceInCents),
                quantity: BigInt(1),
                currency: 'usd',
            };

            const session = await createCheckoutSession.mutateAsync([shoppingItem]);
            
            if (!session?.url) {
                throw new Error('Stripe session missing url');
            }
            
            // Redirect to Stripe checkout
            window.location.href = session.url;
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to start checkout process. Please try again.');
            setProcessingPlan(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stripe Error Warning - Non-blocking */}
            {stripeError && (
                <Alert className="border-yellow-500/30 bg-yellow-500/5">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-sm">
                        <strong>Payment System Warning:</strong> Unable to verify payment configuration. 
                        Upgrade functionality may be temporarily unavailable.
                    </AlertDescription>
                </Alert>
            )}

            {/* Authentication Status Banner */}
            <Card className={cn(
                "border-primary/30",
                isAuthenticated ? "bg-primary/5" : "bg-yellow-500/5"
            )}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-full",
                                isAuthenticated ? "bg-primary/20" : "bg-yellow-500/20"
                            )}>
                                {isAuthenticated ? (
                                    <User className="h-6 w-6 text-primary" />
                                ) : (
                                    <LogIn className="h-6 w-6 text-yellow-500" />
                                )}
                            </div>
                            <div>
                                <h3 className={cn(
                                    "text-lg font-bold",
                                    isAuthenticated ? "text-primary" : "text-yellow-500"
                                )}>
                                    {isAuthenticated ? 'Authenticated' : 'Authentication Required'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {isAuthenticated 
                                        ? `Logged in as ${identity.getPrincipal().toString().slice(0, 10)}...`
                                        : 'Sign in with Internet Identity to upgrade to Pro Access'}
                                </p>
                            </div>
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
                                className="bg-primary hover:bg-primary/90"
                                size="sm"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Sign in with Internet Identity
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Stripe Connection Status Banner */}
            <Card className={cn(
                "border-primary/30",
                hasStripeKeys ? "bg-primary/5" : "bg-yellow-500/5"
            )}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-full",
                                hasStripeKeys ? "bg-primary/20" : "bg-yellow-500/20"
                            )}>
                                {hasStripeKeys ? (
                                    <CheckCircle2 className="h-6 w-6 text-primary" />
                                ) : (
                                    <XCircle className="h-6 w-6 text-yellow-500" />
                                )}
                            </div>
                            <div>
                                <h3 className={cn(
                                    "text-lg font-bold",
                                    hasStripeKeys ? "text-primary" : "text-yellow-500"
                                )}>
                                    {hasStripeKeys ? 'Payment System Active' : 'Payment System Unavailable'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {hasStripeKeys 
                                        ? 'Stripe is configured and ready to process payments'
                                        : 'Payments are currently unavailable. Administrator setup required.'}
                                </p>
                            </div>
                        </div>
                        {!hasStripeKeys && isAdmin && onNavigateToAdmin && (
                            <Button
                                onClick={onNavigateToAdmin}
                                variant="outline"
                                size="sm"
                                className="border-primary/30"
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                Configure Stripe
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Current Subscription Status */}
            {isPro && (
                <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                                <Crown className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-primary">
                                    Pro Access Active
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {subscriptionInfo.status === 'proMonthly' ? 'Monthly Subscription' : 'Annual Subscription'}
                                </p>
                            </div>
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                                Active
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Plans Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {PLANS.map((plan) => {
                    const isCurrent = isPro && (
                        (plan.id === 'pro-monthly' && subscriptionInfo.status === 'proMonthly') ||
                        (plan.id === 'pro-annual' && subscriptionInfo.status === 'proAnnual')
                    );
                    const isProcessing = processingPlan === plan.id;
                    const isPaidPlan = plan.id !== 'free';
                    const canUpgrade = isAuthenticated && hasStripeKeys;

                    return (
                        <Card
                            key={plan.id}
                            className={cn(
                                'relative border-primary/30 transition-all',
                                plan.popular && 'ring-2 ring-primary/50',
                                isCurrent && 'bg-primary/5'
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-primary text-primary-foreground">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}
                            {plan.savings && (
                                <div className="absolute -top-3 right-4">
                                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                                        {plan.savings}
                                    </Badge>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="font-mono uppercase tracking-wider">{plan.name}</span>
                                    {isCurrent && (
                                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                                            Current
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    <div className="mt-2">
                                        <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                                        <span className="text-sm text-muted-foreground ml-2">/ {plan.period}</span>
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">{feature}</span>
                                        </div>
                                    ))}
                                    {plan.limitations && plan.limitations.map((limitation, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <XCircle className="h-4 w-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground/70">{limitation}</span>
                                        </div>
                                    ))}
                                </div>
                                {plan.id === 'free' ? (
                                    <Button
                                        variant="outline"
                                        className="w-full border-primary/30"
                                        disabled
                                    >
                                        Current Plan
                                    </Button>
                                ) : isCurrent ? (
                                    <Button
                                        variant="outline"
                                        className="w-full border-primary/30"
                                        disabled
                                    >
                                        <Crown className="mr-2 h-4 w-4" />
                                        Active Subscription
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleUpgrade(plan.id)}
                                        disabled={!canUpgrade || isProcessing || checkingStripe}
                                        className={cn(
                                            'w-full',
                                            plan.popular && 'bg-primary hover:bg-primary/90'
                                        )}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : checkingStripe ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Checking...
                                            </>
                                        ) : !isAuthenticated ? (
                                            <>
                                                <LogIn className="mr-2 h-4 w-4" />
                                                Sign in to Upgrade
                                            </>
                                        ) : !hasStripeKeys ? (
                                            <>
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Payments Unavailable
                                            </>
                                        ) : (
                                            <>
                                                <Crown className="mr-2 h-4 w-4" />
                                                Upgrade to {plan.name}
                                            </>
                                        )}
                                    </Button>
                                )}
                                {isPaidPlan && !canUpgrade && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        {!isAuthenticated 
                                            ? 'Sign in to enable upgrade'
                                            : 'Payments are currently unavailable'}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Feature Comparison */}
            <Card className="border-primary/30 bg-card/50">
                <CardHeader>
                    <CardTitle className="font-mono uppercase tracking-wider">Why Upgrade to Pro?</CardTitle>
                    <CardDescription>
                        Unlock the full power of SecureDraft AI with unlimited analysis and advanced features
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg border border-primary/20 bg-background/50">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <h4 className="font-semibold">Unlimited Scans</h4>
                            <p className="text-sm text-muted-foreground">
                                No daily limits. Analyze as many messages as you need.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg border border-primary/20 bg-background/50">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                                <MessageSquare className="h-6 w-6 text-primary" />
                            </div>
                            <h4 className="font-semibold">Gemini AI Chat</h4>
                            <p className="text-sm text-muted-foreground">
                                Get AI-powered insights and guidance on your communications.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg border border-primary/20 bg-background/50">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h4 className="font-semibold">Advanced Metrics</h4>
                            <p className="text-sm text-muted-foreground">
                                Full resolution USP/PES tracking and detailed threat analysis.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
