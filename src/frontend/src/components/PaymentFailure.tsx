import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentFailure() {
    const handleRetry = () => {
        window.location.href = '/?tab=console';
    };

    const handleGoBack = () => {
        window.location.href = '/';
    };

    return (
        <div className="container flex min-h-screen items-center justify-center py-12">
            <Card className="w-full max-w-md border-destructive/30 bg-card/50">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <XCircle className="h-10 w-10 text-destructive" />
                        </div>
                    </div>
                    <CardTitle className="text-center font-mono uppercase tracking-wider">
                        Payment Cancelled
                    </CardTitle>
                    <CardDescription className="text-center">
                        Your payment was not completed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                            Your payment was cancelled or failed to process. No charges were made to your account.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Button onClick={handleRetry} className="w-full" variant="default">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                        <Button onClick={handleGoBack} className="w-full" variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to App
                        </Button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                        If you're experiencing issues with payment, please contact support for assistance.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
