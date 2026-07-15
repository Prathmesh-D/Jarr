import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { CheckCircle2, XCircle } from 'lucide-react';

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Reset token is missing from the URL.');
    }
  }, [token]);

  const onSubmit = async (data) => {
    setStatus('submitting');
    setErrorMessage('');
    try {
      await api.post('/auth/reset-password', { token, newPassword: data.password });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to reset password. The token may be expired.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-j-bg flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-j-glow blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-sm w-full bg-j-surface p-8 rounded-2xl border border-j-border shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-j-positive-dim flex items-center justify-center text-j-positive mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-xl font-bold font-heading text-j-ink mb-2">Password Reset!</h1>
          <p className="text-j-ink-3 text-sm mb-6">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
          <Link to="/login" className="w-full">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-j-bg flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-j-glow blur-[100px] rounded-full pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10">
          <h1 className="text-2xl font-bold font-heading text-j-ink">Create new password</h1>
          <p className="text-sm text-j-ink-3 mt-1">Please enter your new password below.</p>
        </div>

        {status === 'error' && (
          <div className="mb-6 flex items-start gap-3 bg-j-negative-dim border border-j-negative/20 rounded-md p-4 text-j-negative">
            <XCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
            disabled={!token || status === 'submitting'}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            disabled={!token || status === 'submitting'}
          />
          
          <Button 
            type="submit" 
            className="w-full mt-2" 
            disabled={!token || status === 'submitting'}
          >
            {status === 'submitting' ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-j-ink-3">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-j-ink hover:text-j-accent transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
