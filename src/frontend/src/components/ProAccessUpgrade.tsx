import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Check, Loader2, AlertCircle } from 'lucide-react';
import { useCreateCheckoutSession, useIsStripeConfigured } from '../hooks/useQueries';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';
import type { ShoppingItem } from '../backend';

export default function ProAccessUpgrade() {
    const [isProcessing, setIsProcessing] = useState(false);
    const createCheckoutSession = useCreateCheckoutSession();
    const { data: isStripeConfigured, isLoading: stripeLoading } = useIsStripeConfigured();
    const { isPro } = useApp();

    const handleUpgrade = async (priceInCents: number, productName: string) => {
        if (!isStripeConfigured) {
            toast.error('Payment system unavailable');
            return;
        }

        setIsProcessing(true);
        try {
            const items: ShoppingItem[] = [
                {
                    productName,
                    productDescription: 'ForeverRaw Pro Access',
                    priceInCents: BigInt(priceInCents),
                    quantity: BigInt(1),
                    currency: 'usd',
                },
            ];

            const session = await createCheckoutSession.mutateAsync(items);
            if (!session?.url) throw new Error('Stripe session missing url');
            window.location.href = session.url;
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Something broke. Hit retry and punch through.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isPro) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <Card className="max-w-2xl dragon-scales border-primary/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Crown className="h-6 w-6" />
                            Pro Access Active
                        </CardTitle>
                        <CardDescription>
                            You already have Pro Access. Punch through limits.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 pt-24">
            <div className="container max-w-6xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-6xl font-bold text-primary blood-glow mb-4 font-display">
                        Upgrade to Pro
                    </h1>
                    <p className="text-2xl text-accent ember-glow">
                        Punch through limits. The Dragon guards unlimited power.
                    </p>
                </div>

                {!isStripeConfigured && !stripeLoading && (
                    <Alert className="mb-8 border-accent bg-accent/10">
                        <AlertCircle className="h-5 w-5 text-accent" />
                        <AlertDescription className="text-accent">
                            Payment system unavailable. Paid upgrades are temporarily disabled.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Free Tier */}
                    <Card className="dragon-scales border-muted/30">
                        <CardHeader>
                            <CardTitle className="text-2xl text-foreground">Free</CardTitle>
                            <CardDescription>For casual punchers</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <p className="text-4xl font-bold text-foreground">$0</p>
                                <p className="text-sm text-muted-foreground">Forever</p>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span>Unlimited chat</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span>10 scans per day</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span>Basic features</span>
                                </li>
                            </ul>
                            <Button disabled className="w-full" variant="outline">
                                Current Plan
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Pro Tier */}
                    <Card className="dragon-scales border-primary/50 shadow-blood relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <div className="bg-accent px-4 py-1 rounded-full">
                                <span className="text-sm font-bold text-accent-foreground">RECOMMENDED</span>
                            </div>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl text-primary flex items-center gap-2">
                                <Crown className="h-6 w-6" />
                                Pro
                            </CardTitle>
                            <CardDescription>Punch through to unlimited</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <p className="text-4xl font-bold text-primary">$9.99</p>
                                <p className="text-sm text-muted-foreground">per month</p>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span className="font-bold">Unlimited scans</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span className="font-bold">Full therapist tools</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span>Consultant access</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span>Resolution guidance</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span>Session management</span>
                                </li>
                            </ul>
                            <Button
                                onClick={() => handleUpgrade(999, 'ForeverRaw Pro Monthly')}
                                disabled={isProcessing || !isStripeConfigured}
                                className="w-full h-14 text-lg font-bold forged-metal border-2 border-primary hover:shadow-blood"
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'PUNCH THROUGH TO PRO'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        No filters. No games. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    );
}
