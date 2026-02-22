import ShareableUrlBanner from './ShareableUrlBanner';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    
    const getAppIdentifier = () => {
        try {
            return encodeURIComponent(window.location.hostname);
        } catch {
            return 'unknown-app';
        }
    };

    return (
        <footer className="border-t border-primary/20 bg-background/95 backdrop-blur dragon-scales">
            <div className="container py-8">
                <div className="flex flex-col items-center justify-center gap-6 text-center">
                    <ShareableUrlBanner />
                    
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-primary font-display">ForeverRaw</h3>
                        <p className="text-sm text-muted-foreground italic">
                            Home of the Gargoyle Dragon
                        </p>
                        <p className="text-xs text-accent font-medium">
                            The Dragon guards your truth
                        </p>
                    </div>

                    <p className="text-xs text-muted-foreground/60 max-w-2xl">
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
