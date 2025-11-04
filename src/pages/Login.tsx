import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authAPI } from '../services/api';
import { useAuthStore } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import logoGreen from '../assets/Budget_Buddy_green.png';

interface LoginForm {
  username: string;
  password: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authAPI.login(data);
      setAuth(response.user, response.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-chalk dark:bg-chalk-dark transition-colors duration-300">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
             <Link to="/">
            <img
              src={logoGreen}
              alt="Budget Buddy Logo"
              className="w-20 h-20 object-contain rounded-2xl shadow-card dark:shadow-card-dark"
            />
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-primary-dark dark:text-chalk mb-2">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-300">Sign in to manage your budget</p>
        </div>

        <div className="bg-white dark:bg-secondary-dark rounded-2xl shadow-card dark:shadow-card-dark p-8 transition-colors duration-300">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-expense/10 border border-expense/20 text-expense text-sm">
                {error}
              </div>
            )}

            <Input
              label="Username or Email"
              autoComplete="off"
              icon={<Mail className="w-5 h-5" />}
              placeholder="Enter your username or email"
              {...register('username', { required: 'Username or email is required' })}
              error={errors.username?.message}
            />

            <Input
              label="Password"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              placeholder="Enter your password"
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
