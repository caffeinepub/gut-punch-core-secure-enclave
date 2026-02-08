import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MainAnalyzer from './components/MainAnalyzer';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';

const rootRoute = createRootRoute({
    component: () => (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">
                <MainAnalyzer />
            </main>
            <Footer />
            <Toaster />
        </div>
    ),
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => null,
});

const paymentSuccessRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payment-success',
    component: () => (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">
                <PaymentSuccess />
            </main>
            <Footer />
            <Toaster />
        </div>
    ),
});

const paymentFailureRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payment-failure',
    component: () => (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">
                <PaymentFailure />
            </main>
            <Footer />
            <Toaster />
        </div>
    ),
});

const routeTree = rootRoute.addChildren([indexRoute, paymentSuccessRoute, paymentFailureRoute]);

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
