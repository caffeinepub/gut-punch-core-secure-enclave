import React, { useEffect, useRef } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  ScanLine,
  Brain,
  FileText,
  Terminal,
  User,
  Zap,
  LogOut,
  LogIn,
  X,
  Flame,
} from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: 'Chat', path: '/', icon: MessageSquare, description: 'Unlimited Punches' },
  { label: 'Scan', path: '/scan', icon: ScanLine, description: 'Threat Detection' },
  { label: 'Consultant', path: '/consultant', icon: Brain, description: 'Dragon Wisdom' },
  { label: 'Safe Draft', path: '/safe-draft', icon: FileText, description: 'Zero-Cloud Vault' },
  { label: 'Console', path: '/console', icon: Terminal, description: 'System Status' },
  { label: 'Profile', path: '/profile', icon: User, description: 'Warrior Identity' },
  { label: 'Upgrade to Pro', path: '/upgrade', icon: Zap, description: 'Unleash the Dragon', highlight: true },
];

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const navigate = useNavigate();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);

  const isAuthenticated = !!identity;

  // Swipe to close
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (diff > 60) onClose();
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onClose]);

  // Swipe from left edge to open (handled in App.tsx overlay)
  useEffect(() => {
    const handleEdgeSwipe = (e: TouchEvent) => {
      if (e.touches[0].clientX < 20) {
        touchStartX.current = e.touches[0].clientX;
      }
    };
    const handleEdgeSwipeEnd = (e: TouchEvent) => {
      if (touchStartX.current < 20) {
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (diff > 60 && !isOpen) {
          // Signal open — handled by parent
        }
      }
    };
    document.addEventListener('touchstart', handleEdgeSwipe, { passive: true });
    document.addEventListener('touchend', handleEdgeSwipeEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleEdgeSwipe);
      document.removeEventListener('touchend', handleEdgeSwipeEnd);
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    navigate({ to: path });
    onClose();
  };

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      onClose();
    } else {
      try {
        await login();
      } catch (err: any) {
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div
      ref={menuRef}
      className={`fixed top-0 left-0 h-full w-72 z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)',
        borderRight: '1px solid rgba(139, 0, 0, 0.4)',
        boxShadow: isOpen ? '4px 0 30px rgba(139, 0, 0, 0.3)' : 'none',
      }}
    >
      {/* Dragon scale texture overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/generated/dragon-scale-texture.dim_512x512.png)',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Header */}
      <div className="relative p-6 border-b border-stone-800">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-blood-red transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dragon emblem */}
        <div className="flex flex-col items-center">
          <img
            src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
            alt="Gargoyle Dragon"
            className="w-20 h-20 object-contain opacity-90 mb-3"
            draggable={false}
          />
          <div className="text-center">
            <h2 className="font-cinzel text-blood-red text-lg font-bold tracking-widest">
              FOREVERRAW
            </h2>
            <p className="text-stone-500 text-xs tracking-wider font-mono mt-1">
              HOME OF THE GARGOYLE DRAGON
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="relative flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all duration-200 group border-b border-stone-900 hover:border-blood-red/30 ${
                item.highlight
                  ? 'hover:bg-blood-red/10'
                  : 'hover:bg-stone-900/60'
              }`}
            >
              <div
                className={`p-2 rounded-sm ${
                  item.highlight
                    ? 'bg-blood-red/20 text-blood-red group-hover:bg-blood-red/30'
                    : 'bg-stone-800 text-stone-400 group-hover:text-blood-red group-hover:bg-stone-700'
                } transition-all duration-200`}
              >
                <Icon size={18} />
              </div>
              <div>
                <div
                  className={`font-cinzel text-sm font-semibold tracking-wider ${
                    item.highlight ? 'text-blood-red' : 'text-stone-200 group-hover:text-blood-red'
                  } transition-colors duration-200`}
                >
                  {item.label}
                </div>
                <div className="text-stone-600 text-xs font-mono mt-0.5">
                  {item.description}
                </div>
              </div>
              {item.highlight && (
                <Flame size={14} className="ml-auto text-ember-orange animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Auth Footer */}
      <div className="relative p-4 border-t border-stone-800">
        <button
          onClick={handleAuth}
          disabled={loginStatus === 'logging-in'}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-sm bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-blood-red/50 text-stone-400 hover:text-stone-200 transition-all duration-200 disabled:opacity-50"
        >
          {isAuthenticated ? (
            <>
              <LogOut size={16} className="text-blood-red" />
              <span className="font-mono text-sm">LEAVE THE FORGE</span>
            </>
          ) : (
            <>
              <LogIn size={16} className="text-ember-orange" />
              <span className="font-mono text-sm">
                {loginStatus === 'logging-in' ? 'ENTERING...' : 'ENTER THE FORGE'}
              </span>
            </>
          )}
        </button>

        <p className="text-center text-stone-700 text-xs font-mono mt-3">
          © {new Date().getFullYear()} FOREVERRAW
        </p>
      </div>
    </div>
  );
}
