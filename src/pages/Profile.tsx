import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User as UserIcon, Mail, Calendar, Edit2, Image, Eye, EyeOff } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { userAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

export const Profile = () => {
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: userAPI.getProfile,
  });

   const { register, handleSubmit, formState: { errors }, reset } = useForm({
    values: user ? {
      name: user.name,
      profilePhotoUrl: user.avatar || '',
    } : undefined
  });

  const updateMutation = useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditModalOpen(false);
      reset();
      setShowPassword(false);
    },
  });

  const onSubmit = (data: any) => {
    const payload: any = {};
    
    if (data.name && data.name.trim()) {
      payload.name = data.name.trim();
    }
    
    if (data.profilePhotoUrl !== undefined) {
      payload.profilePhotoUrl = data.profilePhotoUrl.trim() || null;
    }

    updateMutation.mutate(payload);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 dark:text-gray-500">Loading...</p>
      </div>
    );
  }

  const initials = user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">Profile</h1>

      <Card>
        <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-primary dark:border-primary-light"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-24 h-24 bg-gradient-to-br from-primary to-primary-dark dark:from-primary-light dark:to-primary rounded-full flex items-center justify-center text-white dark:text-primary-dark text-3xl font-bold ${user.avatar ? 'hidden' : ''}`}>
              {initials}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary-dark dark:text-white mb-1">{user.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
        </div>

        <div className="space-y-4 py-6">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary dark:bg-secondary-dark">
            <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/20 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary dark:text-primary-light" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="font-medium text-primary-dark dark:text-white">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary dark:bg-secondary-dark">
            <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary dark:text-primary-light" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
              <p className="font-medium text-primary-dark dark:text-white">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
          <Button
            variant="primary"
            fullWidth
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-center gap-2"
          >
            <Edit2 className="w-5 h-5" />
            Edit Profile
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          reset();
          setShowPassword(false);
        }}
        title="Edit Profile"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            icon={<UserIcon className="w-5 h-5" />}
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message as string}
          />

          <Input
            label="Profile Photo URL"
            icon={<Image className="w-5 h-5" />}
            placeholder="https://example.com/photo.jpg"
            {...register('profilePhotoUrl')}
            error={errors.profilePhotoUrl?.message as string}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setIsEditModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};