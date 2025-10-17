import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuthStore } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}

export const Layout = ({ children, isDark, setIsDark }: LayoutProps) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-chalk dark:bg-chalk-dark transition-colors duration-200">
      <Sidebar onLogout={handleLogout} />
      
      {/* Dark mode toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed top-6 right-6 z-20 lg:top-8 lg:right-8 w-10 h-10 rounded-full bg-secondary dark:bg-secondary-dark shadow-soft dark:shadow-soft-dark flex items-center justify-center text-primary dark:text-primary-light hover:scale-110 transition-transform"
        title={isDark ? 'Light mode' : 'Dark mode'}
      >
        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="px-4 py-8 lg:px-8 lg:py-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
};