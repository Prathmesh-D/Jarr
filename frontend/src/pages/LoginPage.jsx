import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { AppLoader } from '../components/ui/Skeleton';
import JarMascot from '../components/JarMascot';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin, isAuthenticated } = useAuth();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // All hooks must be declared before any conditional returns (Rules of Hooks)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid email or password.');
      setIsSubmitting(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await googleLogin(credentialResponse.credential);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Google login failed.');
      setIsSubmitting(false);
    }
  };

  const onGoogleError = () => {
    setServerError('Google Login was unsuccessful. Try again later.');
  };

  return (
    <div className="min-h-screen bg-j-bg flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-j-glow blur-[100px] rounded-full pointer-events-none" />

      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 w-10 h-10 rounded-sm bg-j-surface border border-j-border flex items-center justify-center text-j-ink-3 hover:text-j-ink hover:border-j-border-strong transition-[border-color,color] duration-fast ease-smooth shadow-sm"
        aria-label="Go back"
      >
        <ArrowLeft size={18} strokeWidth={1.8} />
      </button>
      {(isSubmitting || isRedirecting) && <AppLoader />}
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-j-surface border border-j-border rounded-full text-j-ink mb-5 shadow-sm">
            <JarMascot size={32} fillLevel={0.4} />
          </div>
          <h1 className="text-3xl font-heading font-bold text-j-ink tracking-tight mb-2">Welcome back</h1>
          <p className="text-sm text-j-ink-3">Sign in to your Jarr account</p>
        </div>

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-j-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-j-surface text-j-ink-3">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-j-ink-3 uppercase tracking-widest">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-j-ink-4 hover:text-j-accent transition-colors duration-fast"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          {serverError && (
            <div className="text-sm text-j-negative bg-j-negative-dim border border-j-negative/20 rounded-sm px-3 py-2.5">
              {serverError}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-j-border text-sm text-j-ink-3">
          <p>
            No account?{' '}
            <Link to="/signup" className="text-j-accent font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
