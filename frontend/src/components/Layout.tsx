import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Home, ShoppingBag, Wrench, User, LogIn, LogOut, BookOpen } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import NotificationBell from './NotificationBell';
import ProfileSetupModal from './ProfileSetupModal';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { identity, login, clear, loginStatus, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/generated/student-hub-logo.dim_256x256.png"
              alt="Student Hub"
              className="w-8 h-8 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-extrabold text-xl text-foreground">
              Student<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: 'text-foreground' }}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: 'text-foreground' }}
            >
              Marketplace
            </Link>
            <Link
              to="/services"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: 'text-foreground' }}
            >
              Services
            </Link>
            <Link
              to="/papers"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: 'text-foreground' }}
            >
              Past Papers
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated && <NotificationBell />}

            {isAuthenticated && (
              <Link
                to="/profile"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="w-4 h-4" />
                {userProfile?.displayName || 'Profile'}
              </Link>
            )}

            {!isInitializing && (
              isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Login
                    </>
                  )}
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Profile Setup Modal */}
      {showProfileSetup && <ProfileSetupModal />}

      {/* Main Content */}
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex items-center justify-around h-16">
          <Link
            to="/"
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-2"
            activeProps={{ className: 'flex flex-col items-center gap-1 text-xs text-primary p-2' }}
          >
            <Home className="w-5 h-5" />
            Home
          </Link>
          <Link
            to="/marketplace"
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-2"
            activeProps={{ className: 'flex flex-col items-center gap-1 text-xs text-primary p-2' }}
          >
            <ShoppingBag className="w-5 h-5" />
            Market
          </Link>
          <Link
            to="/services"
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-2"
            activeProps={{ className: 'flex flex-col items-center gap-1 text-xs text-primary p-2' }}
          >
            <Wrench className="w-5 h-5" />
            Services
          </Link>
          <Link
            to="/papers"
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-2"
            activeProps={{ className: 'flex flex-col items-center gap-1 text-xs text-primary p-2' }}
          >
            <BookOpen className="w-5 h-5" />
            Papers
          </Link>
          {isAuthenticated && (
            <Link
              to="/profile"
              className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-2"
              activeProps={{ className: 'flex flex-col items-center gap-1 text-xs text-primary p-2' }}
            >
              <User className="w-5 h-5" />
              Profile
            </Link>
          )}
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mb-16 md:mb-0">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} StudentHub. Built with{' '}
            <span className="text-red-500">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'student-hub')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
