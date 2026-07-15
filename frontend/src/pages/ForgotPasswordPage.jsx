import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmitted(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-j-bg flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-j-ink tracking-tight">
            {submitted ? 'Check your email' : 'Reset password'}
          </h1>
          <p className="text-sm text-j-ink-3 mt-1">
            {submitted
              ? "We've sent reset instructions if an account exists"
              : "Enter your email and we'll help you get back in"}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            {serverError && (
              <div className="text-sm text-j-negative bg-j-negative-dim border border-j-negative/20 rounded-sm px-3 py-2.5">
                {serverError}
              </div>
            )}
            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-j-positive-dim border border-j-positive/20 rounded-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-j-positive shrink-0">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-sm text-j-positive">
              Reset instructions sent. Check your inbox.
            </p>
          </div>
        )}

        <p className="mt-8 text-sm text-j-ink-3">
          <Link to="/login" className="text-j-accent font-medium hover:underline">← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
