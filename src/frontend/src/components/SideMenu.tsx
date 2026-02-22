import { useState, useEffect } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Menu, X, MessageSquare, ScanLine, Users, FileText, Terminal, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useApp } from '../contexts/AppContext';

export default function SideMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;
    const { identity } = useInternetIdentity();
    const { isPro } = useApp();
    const isAuthenticated = !!identity;

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const menuItems = [
        { id: 'chat', path: '/', icon: MessageSquare, label: 'Chat' },
        { id: 'scan', path: '/scan', icon: ScanLine, label: 'Scan' },
        { id: 'consultant', path: '/consultant', icon: Users, label: 'Consultant', proOnly: true },
        { id: 'safe-draft', path: '/safe-draft', icon: FileText, label: 'Safe Draft' },
        { id: 'console', path: '/console', icon: Terminal, label: 'Console' },
        { id: 'profile', path: '/profile', icon: User, label: 'Profile' },
        { id: 'upgrade', path: '/upgrade', icon: Crown, label: 'Upgrade to Pro', highlight: !isPro },
    ];

    const handleNavigate = (path: string) => {
        navigate({ to: path });
        setIsOpen(false);
    };

    return (
        <>
            {/* Hamburger Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 h-12 w-12 rounded-none bg-card/80 backdrop-blur border border-primary/30 hover:bg-primary/20 hover:border-primary"
                aria-label="Open menu"
            >
                <Menu className="h-6 w-6 text-primary" />
            </Button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Side Menu */}
            <aside
                className={`fixed top-0 left-0 z-[70] h-full w-80 bg-[#0a0a0a] border-r border-primary/30 dragon-scales transform transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-primary/30">
                        <div className="flex items-center gap-3">
                            <img
                                src="/assets/generated/dragon-head-logo.dim_64x64.png"
                                alt="ForeverRaw"
                                className="h-12 w-12"
                            />
                            <div>
                                <h2 className="text-xl font-bold text-primary font-display">ForeverRaw</h2>
                                <p className="text-xs text-muted-foreground">Home of the Gargoyle Dragon</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-primary/20"
                        >
                            <X className="h-5 w-5 text-primary" />
                        </Button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = currentPath === item.path;
                                const isDisabled = item.proOnly && !isPro && !isAuthenticated;

                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => !isDisabled && handleNavigate(item.path)}
                                            disabled={isDisabled}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all ${
                                                isActive
                                                    ? 'bg-primary/20 border-l-4 border-primary text-primary'
                                                    : isDisabled
                                                    ? 'text-muted-foreground/50 cursor-not-allowed'
                                                    : item.highlight
                                                    ? 'text-accent hover:bg-accent/20 border-l-4 border-accent'
                                                    : 'text-foreground hover:bg-primary/10 hover:text-primary'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{item.label}</span>
                                            {item.proOnly && !isPro && (
                                                <Crown className="h-4 w-4 ml-auto text-accent" />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-primary/30">
                        <p className="text-xs text-center text-muted-foreground">
                            The Dragon guards your truth
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
