import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, LogIn, Menu, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: any;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onUploadClick?: () => void;
  onNavigate?: (path: string) => void; // Thêm prop để điều hướng
  UserMenuComponent: React.ComponentType<{ user: any; onProfileClick: () => void }>;
}

const Header = ({ user, onLoginClick, onProfileClick, onUploadClick, onNavigate, UserMenuComponent }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      // Fallback cho trường hợp không có onNavigate
      window.location.href = path;
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
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
            <a 
              href="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/');
              }}
            >
              Trang chủ
            </a>
            <a 
              href="#documents" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                const documentsSection = document.getElementById('documents');
                if (documentsSection) {
                  documentsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Tài liệu
            </a>
            <a 
              href="/guide" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/guide');
              }}
            >
              Hướng dẫn
            </a>
            <a 
              href="/contact" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/contact');
              }}
            >
              Liên hệ
            </a>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                {onUploadClick && (
                  <Button 
                    size="sm" 
                    onClick={onUploadClick}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Tải lên
                  </Button>
                )}
                <UserMenuComponent user={user} onProfileClick={onProfileClick} />
              </div>
            ) : (
              <Button onClick={onLoginClick} className="gap-2">
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-200",
          isMobileMenuOpen ? "max-h-64 border-t border-border/40" : "max-h-0"
        )}>
          <nav className="py-4 space-y-4">
            <a 
              href="/" 
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/');
                setIsMobileMenuOpen(false);
              }}
            >
              Trang chủ
            </a>
            <a 
              href="#documents" 
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                const documentsSection = document.getElementById('documents');
                if (documentsSection) {
                  documentsSection.scrollIntoView({ behavior: 'smooth' });
                }
                setIsMobileMenuOpen(false);
              }}
            >
              Tài liệu
            </a>
            <a 
              href="/guide" 
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/guide');
                setIsMobileMenuOpen(false);
              }}
            >
              Hướng dẫn
            </a>
            <a 
              href="/contact" 
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/contact');
                setIsMobileMenuOpen(false);
              }}
            >
              Liên hệ
            </a>
            <div className="pt-2 border-t border-border/40">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                  <UserMenuComponent user={user} onProfileClick={onProfileClick} />
                </div>
              ) : (
                <Button onClick={onLoginClick} className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
