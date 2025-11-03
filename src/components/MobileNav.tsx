import { NavLink } from 'react-router-dom';
import { Home, CreditCard, BarChart3, User, Settings } from 'lucide-react';

export const MobileNav = () => {
  const links = [
    { to: '/dashboard', icon: Home },
    { to: '/transactions', icon: CreditCard },
    { to: '/categories', icon: BarChart3 },
    { to: '/profile', icon: User },
    { to: '/settings', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-secondary-dark border-t border-gray-100 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around px-2 py-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-400 dark:text-gray-500 hover:text-primary-dark dark:hover:text-primary-light hover:bg-secondary dark:hover:bg-secondary-dark-lighter'
              }`
            }
          >
            <link.icon className="w-6 h-6" />
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
