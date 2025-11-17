import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User as UserIcon, DollarSign } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authAPI } from '../services/api';
import { useAuthStore } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import logo from '../assets/Budget_Buddy_green.png';

interface RegisterForm {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  currency: string;
}

export const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

 const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { currency: 'PHP' } 
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');
    try {
      const { confirmPassword, ...registerData } = data;
      const response = await authAPI.register(registerData);
      setAuth(response.user, response.token);
      navigate('/onboarding');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-chalk dark:bg-chalk-dark transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <img
              src={logo}
              alt="Budget Buddy Logo"
              className="w-16 h-16 object-contain rounded-xl shadow-card cursor-pointer"
            />
          </Link>
          <h1 className="text-3xl font-bold text-primary-dark dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Start managing your budget today</p>
        </div>

        <div className="rounded-2xl shadow-card p-8 bg-white dark:bg-secondary-dark transition-colors duration-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-expense/10 border border-expense/20 text-expense text-sm">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              icon={<UserIcon className="w-5 h-5" />}
              placeholder="Enter your full name"
              autoComplete="off"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
            />

            <Input
              label="Username"
              autoComplete="off"
              icon={<UserIcon className="w-5 h-5" />}
              placeholder="Choose a username"
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' }
              })}
              error={errors.username?.message}
            />

            <Input
              label="Email"
              type="email"
              autoComplete="off"
              icon={<Mail className="w-5 h-5" />}
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
              })}
              error={errors.email?.message}
            />

            <div>
              <label className="block text-sm font-medium text-primary-dark dark:text-white mb-2">
                Preferred Currency
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
                <select
                  {...register('currency', { required: 'Currency is required' })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-secondary-dark text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent transition-all duration-200"
                >
                <option value="PHP">PHP - Philippine Peso</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - US Dollar</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="CHF">CHF - Swiss Franc</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
              </div>
              {errors.currency && (
                <p className="mt-1 text-sm text-expense">{errors.currency.message}</p>
              )}
            </div>

            <Input
              label="Password"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              placeholder="Create a secure password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message: 'Password must contain uppercase, lowercase, number and special character'
                }
              })}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              placeholder="Confirm your password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              error={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary dark:text-primary-light font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
