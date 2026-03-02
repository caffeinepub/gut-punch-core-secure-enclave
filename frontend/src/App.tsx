import React, { useState, useEffect } from 'react';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MenuProvider, useMenu } from './contexts/MenuContext';
import { AppProvider } from './contexts/AppContext';
import SideMenu from './components/SideMenu';
import ChatScreen from './components/ChatScreen';
import ScanScreen from './components/ScanScreen';
import ConsultantScreen from './components/ConsultantScreen';
import SafeDraftScreen from './components/SafeDraftScreen';
import ConsoleScreen from './components/ConsoleScreen';
import ProfileView from './components/ProfileView';
import ProAccessUpgrade from './components/ProAccessUpgrade';
import BanScreen from './components/BanScreen';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import { useIsBannedUser } from './hooks/useQueries';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { Menu } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function BanGate({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: isBanned, isLoading } = useIsBannedUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-blood-red font-cinzel text-xl animate-pulse">
          THE DRAGON WATCHES...
        </div>
      </div>
    );
  }

  if (identity && isBanned) {
    return <BanScreen />;
  }

  return <>{children}</>;
}

function HamburgerButton() {
  const { toggleMenu } = useMenu();
  return (
    <button
      onClick={toggleMenu}
      className="fixed top-4 left-4 z-50 p-2 rounded-md bg-void-800 border border-stone-700 hover:border-blood-red hover:text-blood-red text-stone-400 transition-all duration-200 shadow-blood"
      aria-label="Open menu"
    >
      <Menu size={24} />
    </button>
  );
}

function AppLayout() {
  const { isOpen, setMenuOpen } = useMenu();

  return (
    <div className="min-h-screen bg-void text-stone-200 relative">
      <HamburgerButton />
      <SideMenu isOpen={isOpen} onClose={() => setMenuOpen(false)} />
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <BanGate>
        <Outlet />
      </BanGate>
    </div>
  );
}

const rootRoute = createRootRoute({ component: AppLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ChatScreen,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: ChatScreen,
});

const scanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scan',
  component: ScanScreen,
});

const consultantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/consultant',
  component: ConsultantScreen,
});

const safeDraftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/safe-draft',
  component: SafeDraftScreen,
});

const consoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/console',
  component: ConsoleScreen,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfileView,
});

const upgradeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upgrade',
  component: ProAccessUpgrade,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailure,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  chatRoute,
  scanRoute,
  consultantRoute,
  safeDraftRoute,
  consoleRoute,
  profileRoute,
  upgradeRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <MenuProvider>
          <RouterProvider router={router} />
          <Toaster theme="dark" />
        </MenuProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}
