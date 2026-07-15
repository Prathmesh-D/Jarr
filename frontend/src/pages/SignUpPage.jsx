import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  currency: z.string().min(1).max(3).default('INR'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const currencies = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

export default function SignUpPage() {
  const navigate = useNavigate();
  const { register: registerUser, googleLogin } = useAuth();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { currency: 'INR' },
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, currency: data.currency });
      setIsSuccess(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await googleLogin(credentialResponse.credential);
      setIsRedirecting(true);
      // Wait a moment then redirect to dashboard (since Google users are auto-verified)
      setTimeout(() => navigate('/dashboard', { replace: true }), 800);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Google signup failed.');
      setIsSubmitting(false);
    }
  };

  const onGoogleError = () => {
    setServerError('Google Signup was unsuccessful. Try again later.');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-j-bg flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-j-glow blur-[100px] rounded-full pointer-events-none" />
        <JarMascot size={80} fillLevel={100} />
        <h1 className="text-2xl font-bold font-heading text-j-ink mt-6 mb-2">Check your email</h1>
        <p className="text-j-ink-3 mb-8 max-w-sm">
          We've sent a verification link to your email. Please click the link to activate your account.
        </p>
        <Link to="/login">
          <Button variant="secondary" className="w-full max-w-[200px]">Return to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-j-bg flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-j-glow blur-[100px] rounded-full pointer-events-none" />

      {isRedirecting && <AppLoader />}

      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 w-10 h-10 rounded-sm bg-j-surface border border-j-border flex items-center justify-center text-j-ink-3 hover:text-j-ink hover:border-j-border-strong transition-[border-color,color] duration-fast ease-smooth shadow-sm"
        aria-label="Go back"
      >
        <ArrowLeft size={18} strokeWidth={1.8} />
      </button>
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-j-surface border border-j-border rounded-full text-j-ink mb-5 shadow-sm">
            <JarMascot size={32} fillLevel={0.2} />
          </div>
          <h1 className="text-3xl font-heading font-bold text-j-ink tracking-tight mb-2">Create account</h1>
          <p className="text-sm text-j-ink-3">Start tracking your finances today</p>
        </div>

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-j-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-j-surface text-j-ink-3">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" placeholder="At least 8 characters" error={errors.password?.message} {...register('password')} />
          <Input label="Confirm Password" type="password" placeholder="Repeat your password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-j-ink-3 uppercase tracking-widest">Currency</label>
            <select
              {...register('currency')}
              className="h-11 px-3 border border-j-border rounded-sm bg-j-surface text-sm text-j-ink focus:border-j-border-strong focus:ring-2 focus:ring-j-accent/12 outline-none transition-[border-color] duration-base"
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {serverError && (
            <div className="text-sm text-j-negative bg-j-negative-dim border border-j-negative/20 rounded-sm px-3 py-2.5">
              {serverError}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Get Started'}
          </Button>
        </form>

        <p className="mt-6 pt-6 border-t border-j-border text-sm text-j-ink-3">
          Already have an account?{' '}
          <Link to="/login" className="text-j-accent font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
