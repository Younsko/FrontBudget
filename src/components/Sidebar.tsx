import { NavLink } from 'react-router-dom';
import { Home, CreditCard, BarChart3, User, Settings, LogOut } from 'lucide-react';
import logo from '../assets/Budget_Buddy_green.png';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar = ({ onLogout }: SidebarProps) => {
  const links = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/transactions', icon: CreditCard, label: 'Transactions' },
    { to: '/categories', icon: BarChart3, label: 'Categories' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-secondary-dark border-r border-gray-100 dark:border-gray-700 z-30">
      {/* --- Logo above --- */}
      <div className="flex items-center gap-3 px-6 py-8">
        <img
          src={logo}
          alt="Budget Buddy Logo"
          className="w-10 h-10 object-contain rounded-lg"
        />
        <span className="text-xl font-semibold text-primary-dark dark:text-primary-light">
          BudgetBuddy
        </span>
      </div>

      {/* --- Nav links --- */}
      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-secondary dark:hover:bg-secondary-dark-lighter hover:text-primary-dark dark:hover:text-primary-light'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* --- Logout Button --- */}
      <div className="p-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-expense dark:text-expense-dark hover:bg-expense/10 dark:hover:bg-expense-dark/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
