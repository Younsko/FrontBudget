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
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../services/api';

export const Layout = ({ children, isDark, setIsDark }: LayoutProps) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: userAPI.getProfile,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-chalk dark:bg-chalk-dark transition-colors duration-200">
      <Sidebar onLogout={handleLogout} />
      
      {/* Header avec photo de profil et dark mode toggle */}
      <div className="lg:pl-64">
        <header className="bg-white dark:bg-secondary-dark border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-4 py-4 lg:px-8 flex items-center justify-between">
            <div className="flex-1"></div> {/* Espace vide à gauche */}
            
            <div className="flex items-center gap-4">
              {/* Photo de profil */}
              <div className="flex items-center gap-2">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary dark:border-primary-light"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div 
                  className={`w-8 h-8 bg-gradient-to-br from-primary to-primary-dark dark:from-primary-light dark:to-primary rounded-full flex items-center justify-center text-white dark:text-primary-dark text-xs font-bold ${user?.avatar ? 'hidden' : ''}`}
                >
                  {initials}
                </div>
              </div>

              {/* Dark mode toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="w-8 h-8 rounded-full bg-secondary dark:bg-secondary-dark shadow-soft dark:shadow-soft-dark flex items-center justify-center text-primary dark:text-primary-light hover:scale-110 transition-transform"
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </header>
      </div>

      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="px-4 py-8 lg:px-8 lg:py-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
