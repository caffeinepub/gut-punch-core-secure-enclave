import { Lock } from 'lucide-react';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="container flex h-20 items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/30">
                        <Lock className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            GUT-<span className="text-primary">PUNCH</span>
                        </h1>
                        <p className="text-xs text-primary/70 uppercase tracking-wider font-mono">
                            ● Core Secure Enclave
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
