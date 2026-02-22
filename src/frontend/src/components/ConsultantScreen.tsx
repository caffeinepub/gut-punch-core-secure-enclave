import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Lock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export default function ConsultantScreen() {
    const { isPro } = useApp();
    const navigate = useNavigate();

    if (!isPro) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <Card className="max-w-2xl dragon-scales border-primary/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Lock className="h-6 w-6" />
                            Pro Access Required
                        </CardTitle>
                        <CardDescription>
                            Consultant tools are available for Pro subscribers only
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert className="border-accent bg-accent/10 mb-4">
                            <AlertDescription className="text-accent">
                                Upgrade to Pro to access resolution guidance and therapist session tools.
                            </AlertDescription>
                        </Alert>
                        <Button
                            onClick={() => navigate({ to: '/upgrade' })}
                            className="w-full forged-metal border-2 border-accent hover:shadow-ember"
                        >
                            Upgrade to Pro
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 pt-24">
            <div className="container max-w-6xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-bold text-primary blood-glow mb-4 font-display">
                        Consultant
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Resolution guidance and session management
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="dragon-scales border-primary/30 bg-card/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Users className="h-6 w-6" />
                                Session Notes
                            </CardTitle>
                            <CardDescription>
                                Track and manage therapeutic sessions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Create and organize session notes with clients. The Dragon guards your records.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="dragon-scales border-primary/30 bg-card/50">
                        <CardHeader>
                            <CardTitle className="text-primary">Resolution Guidance</CardTitle>
                            <CardDescription>
                                Tools to help navigate difficult conversations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Access resolution frameworks and guidance. No filters. No games.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
