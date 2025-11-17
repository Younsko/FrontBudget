import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock, Globe, Sun, Moon, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { userAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuthStore } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';

export const Settings = () => {
  const navigate = useNavigate();
  const { supportedCurrencies } = useCurrency();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  
  // État pour détecter le dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Détecter le dark mode au chargement et aux changements
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Vérifier au montage
    checkDarkMode();
    
    // Observer les changements de classe sur l'élément HTML
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: userAPI.getProfile,
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, watch, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();
  const { register: registerDelete, handleSubmit: handleSubmitDelete, formState: { errors: deleteErrors } } = useForm();
  const { register: registerCurrency, handleSubmit: handleSubmitCurrency, setValue } = useForm({
    defaultValues: {
      currency: user?.currency || 'PHP'
    }
  });

  const newPassword = watch('newPassword');

  const updateCurrencyMutation = useMutation({
    mutationFn: (currency: string) => userAPI.updateSettings({ preferredCurrency: currency }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: ({ password, confirmation }: { password: string; confirmation: string }) =>
      userAPI.deleteAccount(password, confirmation),
    onSuccess: () => {
      logout();
      navigate('/login');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: any) => userAPI.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      setIsPasswordModalOpen(false);
      resetPassword();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    },
  });

  const onPasswordSubmit = (data: any) => {
    updatePasswordMutation.mutate(data);
  };

  const onCurrencySubmit = (data: any) => {
    if (data.currency) {
      updateCurrencyMutation.mutate(data.currency);
      setValue('currency', data.currency);
    }
  };

  const onDeleteSubmit = (data: any) => {
    deleteAccountMutation.mutate({
      password: data.password,
      confirmation: data.confirmation
    });
  };

  const getCurrencyName = (currency: string) => {
    const names: { [key: string]: string } = {
      PHP: 'Philippine Peso',
      EUR: 'Euro',
      USD: 'US Dollar',
      GBP: 'British Pound',
      CAD: 'Canadian Dollar',
      CHF: 'Swiss Franc',
      JPY: 'Japanese Yen',
      AUD: 'Australian Dollar',
    };
    return names[currency] || currency;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">Settings</h1>

      <Card>
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/20 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary dark:text-primary-light" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary-dark dark:text-white">Security</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your password and security settings</p>
          </div>
        </div>
        <div className="pt-4">
          <Button
            variant="secondary"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            Change Password
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-info/10 dark:bg-info-dark/20 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-info dark:text-info-dark" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary-dark dark:text-white">Preferences</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Customize your experience</p>
          </div>
        </div>
        <form onSubmit={handleSubmitCurrency(onCurrencySubmit)} className="pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-dark dark:text-white mb-2">
              Default Currency
            </label>
            <select
              {...registerCurrency('currency')}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-secondary-dark
                focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent
                text-primary-dark dark:text-white"
            >
              {supportedCurrencies.map(curr => (
                <option key={curr} value={curr}>
                  {curr} - {getCurrencyName(curr)}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="primary" disabled={updateCurrencyMutation.isPending}>
            {updateCurrencyMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/20 rounded-xl flex items-center justify-center">
            {isDarkMode ? (
              <Moon className="w-6 h-6 text-primary dark:text-white" />
            ) : (
              <Sun className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary-dark dark:text-white">Theme</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
          </div>
        </div>
        <div className="pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            You can toggle between light and dark mode using the button in the top right corner
          </p>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 dark:bg-primary-light/10 border border-primary/20 dark:border-primary-light/30">
            {isDarkMode ? (
              <>
                <Moon className="w-5 h-5 text-white" />
                <div>
                  <p className="font-medium text-primary-dark dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                </div>
              </>
            ) : (
              <>
                <Sun className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-primary-dark">Light Mode</p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-expense/10 dark:bg-expense-dark/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-expense dark:text-expense-dark" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-expense dark:text-expense-dark">Danger Zone</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your account and all data</p>
          </div>
        </div>
        <div className="pt-4">
          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Password Change Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          resetPassword();
          setShowCurrentPassword(false);
          setShowNewPassword(false);
          setShowConfirmPassword(false);
        }}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              icon={<Lock className="w-5 h-5" />}
              {...registerPassword('currentPassword', { required: 'Current password is required' })}
              error={passwordErrors.currentPassword?.message as string}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              icon={<Lock className="w-5 h-5" />}
              {...registerPassword('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              error={passwordErrors.newPassword?.message as string}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              icon={<Lock className="w-5 h-5" />}
              {...registerPassword('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === newPassword || 'Passwords do not match'
              })}
              error={passwordErrors.confirmPassword?.message as string}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setIsPasswordModalOpen(false);
                resetPassword();
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account"
        size="md"
      >
        <form onSubmit={handleSubmitDelete(onDeleteSubmit)} className="space-y-4">
          <div className="p-4 rounded-lg bg-expense/10 dark:bg-expense-dark/20 border border-expense/20 dark:border-expense-dark/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-expense dark:text-expense-dark mt-0.5" />
              <div>
                <p className="font-medium text-expense dark:text-expense-dark mb-1">Warning: This action cannot be undone</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All your data, including transactions, categories, and profile information will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Input
              label="Confirm Password"
              type={showDeletePassword ? 'text' : 'password'}
              icon={<Lock className="w-5 h-5" />}
              placeholder="Enter your password"
              {...registerDelete('password', { required: 'Password is required' })}
              error={deleteErrors.password?.message as string}
            />
            <button
              type="button"
              onClick={() => setShowDeletePassword(!showDeletePassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showDeletePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Input
            label="Type DELETE_ZONE1 to confirm"
            placeholder="DELETE_ZONE1"
            {...registerDelete('confirmation', {
              required: 'Confirmation is required',
              validate: value => value === 'DELETE_ZONE1' || 'Must type DELETE_ZONE1 exactly'
            })}
            error={deleteErrors.confirmation?.message as string}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              fullWidth
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? 'Deleting...' : 'Yes, Delete My Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};