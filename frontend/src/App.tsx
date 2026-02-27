import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MarketplaceListingsPage from './pages/MarketplaceListingsPage';
import ServiceListingsPage from './pages/ServiceListingsPage';
import CreateMarketplaceListingPage from './pages/CreateMarketplaceListingPage';
import CreateServiceListingPage from './pages/CreateServiceListingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import MeetupTrackerPage from './pages/MeetupTrackerPage';
import PapersListingPage from './pages/PapersListingPage';
import UploadPaperPage from './pages/UploadPaperPage';
import React from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 30_000,
    },
    mutations: {
      retry: false,
    },
  },
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace',
  component: MarketplaceListingsPage,
});

const createMarketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace/create',
  component: CreateMarketplaceListingPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services',
  component: ServiceListingsPage,
});

const createServiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/create',
  component: CreateServiceListingPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const meetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/meetup/$listingId',
  component: MeetupTrackerPage,
});

const papersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/papers',
  component: PapersListingPage,
});

const uploadPaperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/papers/upload',
  component: UploadPaperPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  marketplaceRoute,
  createMarketplaceRoute,
  servicesRoute,
  createServiceRoute,
  adminRoute,
  profileRoute,
  meetupRoute,
  papersRoute,
  uploadPaperRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
