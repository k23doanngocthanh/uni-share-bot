import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, LogIn, Menu, X, Upload, HelpCircle, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import UserMenu from '@/components/UserMenu';
import AuthModal from '@/components/AuthModal';
import ProfileModal from '@/components/ProfileModal';
import FileUploadModal from '@/components/FileUploadModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="p-2 bg-primary rounded-lg">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">UniShare</h1>
                <p className="text-xs text-muted-foreground">Chia sẻ tài liệu</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  isActive('/') && "text-foreground font-medium"
                )}
                onClick={() => navigate('/')}
              >
                Trang chủ
              </button>
              <button 
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  isActive('/guide') && "text-foreground font-medium"
                )}
                onClick={() => navigate('/guide')}
              >
                Hướng dẫn
              </button>
              <button 
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  isActive('/contact') && "text-foreground font-medium"
                )}
                onClick={() => navigate('/contact')}
              >
                Liên hệ
              </button>
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setShowUploadModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Tải lên
                  </Button>
                  <UserMenu user={user} onProfileClick={() => setShowProfileModal(true)} />
                </div>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/40">
              <nav className="flex flex-col space-y-4">
                <button
                  className={cn(
                    "text-left text-muted-foreground hover:text-foreground transition-colors",
                    isActive('/') && "text-foreground font-medium"
                  )}
                  onClick={() => {
                    navigate('/');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Trang chủ
                </button>
                <button
                  className={cn(
                    "text-left text-muted-foreground hover:text-foreground transition-colors",
                    isActive('/guide') && "text-foreground font-medium"
                  )}
                  onClick={() => {
                    navigate('/guide');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Hướng dẫn
                </button>
                <button
                  className={cn(
                    "text-left text-muted-foreground hover:text-foreground transition-colors",
                    isActive('/contact') && "text-foreground font-medium"
                  )}
                  onClick={() => {
                    navigate('/contact');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Liên hệ
                </button>
                <hr className="border-border/40" />
                {user ? (
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setShowUploadModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Tải lên tài liệu
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setShowProfileModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      Hồ sơ cá nhân
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMobileMenuOpen(false);
                    }} 
                    className="w-full gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Đăng nhập
                  </Button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />

      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => setShowUploadModal(false)}
        user={user}
      />
    </div>
  );
};

export default Layout;
