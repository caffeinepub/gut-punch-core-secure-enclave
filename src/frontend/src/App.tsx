import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Menu } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import AdminDashboard from "./components/AdminDashboard";
import BanScreen from "./components/BanScreen";
import BandwidthSidebar from "./components/BandwidthSidebar";
import ChatScreen from "./components/ChatScreen";
import ConsoleScreen from "./components/ConsoleScreen";
import ConsultantScreen from "./components/ConsultantScreen";
import DestroyRebuildSection from "./components/DestroyRebuildSection";
import ForgeSplashScreen from "./components/ForgeSplashScreen";
import LedgerSearchBar from "./components/LedgerSearchBar";
import MasterStrikeButton from "./components/MasterStrikeButton";
import PaymentFailure from "./components/PaymentFailure";
import PaymentSuccess from "./components/PaymentSuccess";
import ProAccessUpgrade from "./components/ProAccessUpgrade";
import ProfileView from "./components/ProfileView";
import SafeDraftScreen from "./components/SafeDraftScreen";
import SanctuaryModeToggle from "./components/SanctuaryModeToggle";
import ScanScreen from "./components/ScanScreen";
import SideMenu from "./components/SideMenu";
import VoiceNav from "./components/VoiceNav";
import { AppProvider, useApp } from "./contexts/AppContext";
import { MenuProvider, useMenu } from "./contexts/MenuContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsBannedUser } from "./hooks/useQueries";

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
      type="button"
      onClick={toggleMenu}
      className="fixed top-4 left-4 z-50 p-2 bg-void-800 border border-stone-700 hover:border-amber-glow hover:text-amber-glow text-stone-400 transition-all duration-200 shadow-blood"
      style={{ borderRadius: 2 }}
      aria-label="Open menu"
      data-ocid="nav.menu.button"
    >
      <Menu size={24} />
    </button>
  );
}

function TacticalHUD() {
  const { sanctuaryMode, threatScanState } = useApp();
  const threatActive =
    sanctuaryMode === "PERIMETER_DEFENSE" && threatScanState.threatActive;

  return (
    <>
      {/* Ledger Search Header Bar */}
      <div
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          paddingLeft: 56,
          paddingRight: 36,
          background:
            "linear-gradient(180deg, oklch(0.07 0.006 270) 0%, oklch(0.06 0.005 270 / 0.95) 100%)",
          borderBottom: threatActive
            ? "1px solid oklch(0.72 0.18 55)"
            : "1px solid oklch(0.16 0.008 270)",
          boxShadow: threatActive
            ? "0 0 20px oklch(0.72 0.18 55 / 0.3)"
            : "0 2px 8px oklch(0 0 0 / 0.4)",
          animation: threatActive ? "hud-flicker 1.5s ease-in-out 3" : "none",
        }}
      >
        <div className="flex items-center gap-3 py-2">
          {/* Spacer for hamburger */}
          <div style={{ width: 8 }} />
          {/* Ledger Search */}
          <div className="flex-1">
            <LedgerSearchBar />
          </div>
          {/* Sanctuary Toggle */}
          <div className="shrink-0">
            <SanctuaryModeToggle />
          </div>
          {/* Master Strike */}
          <div className="shrink-0">
            <MasterStrikeButton />
          </div>
        </div>
      </div>

      {/* Bandwidth Sidebar */}
      <BandwidthSidebar />
    </>
  );
}

function AppLayout() {
  const { isOpen, setMenuOpen } = useMenu();

  return (
    <div className="min-h-screen bg-void text-stone-200 relative">
      <HamburgerButton />
      <TacticalHUD />
      <SideMenu isOpen={isOpen} onClose={() => setMenuOpen(false)} />
      {isOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setMenuOpen(false);
          }}
        />
      )}
      <BanGate>
        {/* Push content below the fixed HUD bar */}
        <div style={{ paddingTop: 72 }}>
          <Outlet />
        </div>
      </BanGate>
      <VoiceNav />
    </div>
  );
}

const rootRoute = createRootRoute({ component: AppLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ForgeSplashScreen,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: ChatScreen,
});

const scanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scan",
  component: ScanScreen,
});

const consultantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/consultant",
  component: ConsultantScreen,
});

const safeDraftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/safe-draft",
  component: SafeDraftScreen,
});

const consoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/console",
  component: ConsoleScreen,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfileView,
});

const upgradeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upgrade",
  component: ProAccessUpgrade,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailure,
});

const destroyRebuildRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/destroy-rebuild",
  component: DestroyRebuildSection,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
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
  destroyRebuildRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
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
