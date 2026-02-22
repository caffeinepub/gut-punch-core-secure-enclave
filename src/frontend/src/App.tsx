import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { AppProvider } from './contexts/AppContext';
import { useTrackAppOpenOnce } from './hooks/useTrackAppOpenOnce';
import SideMenu from './components/SideMenu';
import SocialFeed from './components/SocialFeed';
import DiscoverView from './components/DiscoverView';
import ScanScreen from './components/ScanScreen';
import ConsultantScreen from './components/ConsultantScreen';
import SafeDraftScreen from './components/SafeDraftScreen';
import ConsoleScreen from './components/ConsoleScreen';
import ChatListView from './components/ChatListView';
import ChatScreen from './components/ChatScreen';
import ProfileView from './components/ProfileView';
import AdminDashboard from './components/AdminDashboard';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import ProAccessUpgrade from './components/ProAccessUpgrade';

function RootLayout() {
    useTrackAppOpenOnce();

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <SideMenu />
            <main className="flex-1">
                <Outlet />
            </main>
            <Toaster />
        </div>
    );
}

const rootRoute = createRootRoute({
    component: RootLayout,
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: SocialFeed,
});

const discoverRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/discover',
    component: DiscoverView,
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

const chatListRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/chat',
    component: ChatListView,
});

const chatScreenRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/chat/$userId',
    component: ChatScreen,
});

const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    component: ProfileView,
});

const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: AdminDashboard,
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
    discoverRoute,
    scanRoute,
    consultantRoute,
    safeDraftRoute,
    consoleRoute,
    chatListRoute,
    chatScreenRoute,
    profileRoute,
    adminRoute,
    upgradeRoute,
    paymentSuccessRoute,
    paymentFailureRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
            <AppProvider>
                <RouterProvider router={router} />
            </AppProvider>
        </ThemeProvider>
    );
}
