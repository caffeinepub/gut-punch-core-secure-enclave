import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

export default function ConsoleScreen() {
    return (
        <div className="min-h-screen p-8 pt-24">
            <div className="container max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-bold text-primary blood-glow mb-4 font-display">
                        Console
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        System status and diagnostics
                    </p>
                </div>

                <Card className="dragon-scales border-primary/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Terminal className="h-6 w-6" />
                            System Console
                        </CardTitle>
                        <CardDescription>
                            Monitor your ForeverRaw experience
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-background/50 border border-primary/30 rounded p-4 font-mono text-sm">
                            <p className="text-primary">{'>'} System Status: ONLINE</p>
                            <p className="text-accent">{'>'} Dragon Guard: ACTIVE</p>
                            <p className="text-muted-foreground">{'>'} No filters. No games.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
