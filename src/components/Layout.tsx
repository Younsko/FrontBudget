import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuthStore } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-chalk">
      <Sidebar onLogout={handleLogout} />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="px-4 py-8 lg:px-8 lg:py-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
