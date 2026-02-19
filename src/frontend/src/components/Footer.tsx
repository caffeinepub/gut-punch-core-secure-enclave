import ShareableUrlBanner from './ShareableUrlBanner';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    
    // Generate app identifier for UTM tracking
    const getAppIdentifier = () => {
        try {
            return encodeURIComponent(window.location.hostname);
        } catch {
            return 'unknown-app';
        }
    };

    return (
        <footer className="border-t border-primary/20 bg-background/95 backdrop-blur">
            <div className="container py-6">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                    {/* Shareable URL Banner */}
                    <ShareableUrlBanner />
                    
                    <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-primary font-mono font-semibold uppercase tracking-wider text-xs">
                                Secure JS Thread
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-2xl">
                        Text input is analyzed using regex-based local logic. No content ever leaves this browser session unless cloud features are enabled.
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                        © {currentYear}. Built with ❤️ using{' '}
                        <a
                            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${getAppIdentifier()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary/80 hover:text-primary underline-offset-4 hover:underline"
                        >
                            caffeine.ai
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
