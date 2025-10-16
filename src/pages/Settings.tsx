import { useState } from 'react';
import { Lock, Globe, Palette, AlertTriangle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuthStore } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const newPassword = watch('newPassword');

  const onPasswordSubmit = (data: any) => {
    console.log('Password change:', data);
    setIsPasswordModalOpen(false);
    reset();
  };

  const handleDeleteAccount = () => {
    console.log('Account deletion requested');
    logout();
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-primary-dark">Settings</h1>

      <Card>
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary-dark">Security</h3>
            <p className="text-sm text-gray-600">Manage your password and security settings</p>
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
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-info" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary-dark">Preferences</h3>
            <p className="text-sm text-gray-600">Customize your experience</p>
          </div>
        </div>
        <div className="pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-dark mb-2">
              Default Currency
            </label>
            <select
              defaultValue="EUR"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-dark mb-2">
              Language
            </label>
            <select
              defaultValue="en"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary-dark">Theme</h3>
            <p className="text-sm text-gray-600">Light mode only (Green theme)</p>
          </div>
        </div>
        <div className="pt-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="w-8 h-8 bg-primary rounded-lg" />
            <div>
              <p className="font-medium text-primary-dark">Green Theme</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 bg-expense/10 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-expense" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-expense">Danger Zone</h3>
            <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
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

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          reset();
        }}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            icon={<Lock className="w-5 h-5" />}
            {...register('currentPassword', { required: 'Current password is required' })}
            error={errors.currentPassword?.message as string}
          />

          <Input
            label="New Password"
            type="password"
            icon={<Lock className="w-5 h-5" />}
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            error={errors.newPassword?.message as string}
          />

          <Input
            label="Confirm New Password"
            type="password"
            icon={<Lock className="w-5 h-5" />}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === newPassword || 'Passwords do not match'
            })}
            error={errors.confirmPassword?.message as string}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setIsPasswordModalOpen(false);
                reset();
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-expense/10 border border-expense/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-expense mt-0.5" />
              <div>
                <p className="font-medium text-expense mb-1">Warning: This action cannot be undone</p>
                <p className="text-sm text-gray-600">
                  All your data, including transactions, categories, and profile information will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Are you sure you want to delete your account? This will permanently remove all your data.
          </p>

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
              type="button"
              variant="danger"
              fullWidth
              onClick={handleDeleteAccount}
            >
              Yes, Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
