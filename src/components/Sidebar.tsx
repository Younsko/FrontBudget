import { NavLink } from 'react-router-dom';
import { Home, CreditCard, BarChart3, User, Settings, LogOut, Wallet } from 'lucide-react';

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
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-100 z-30">
      <div className="flex items-center gap-2 px-6 py-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-semibold text-primary-dark">BudgetBuddy</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-gray-600 hover:bg-secondary hover:text-primary-dark'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-expense hover:bg-expense/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
