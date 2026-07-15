import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import JarMascot from '../components/JarMascot';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing from the URL.');
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const verify = async () => {
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-j-bg flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-j-glow blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-sm w-full bg-j-surface p-8 rounded-2xl border border-j-border shadow-sm flex flex-col items-center">
        {status === 'loading' && (
          <>
            <JarMascot size={64} fillLevel={50} />
            <h1 className="text-xl font-bold font-heading text-j-ink mt-6 mb-2">Verifying...</h1>
            <p className="text-j-ink-3 text-sm">Please wait while we verify your email address.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-j-positive-dim flex items-center justify-center text-j-positive mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-xl font-bold font-heading text-j-ink mb-2">Email Verified!</h1>
            <p className="text-j-ink-3 text-sm mb-6">
              Your account is now active. You can log in and start tracking your expenses.
            </p>
            <Link to="/login" className="w-full">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-j-negative-dim flex items-center justify-center text-j-negative mb-4">
              <XCircle size={32} />
            </div>
            <h1 className="text-xl font-bold font-heading text-j-ink mb-2">Verification Failed</h1>
            <p className="text-j-ink-3 text-sm mb-6">
              {errorMessage}
            </p>
            <Link to="/login" className="w-full">
              <Button variant="secondary" className="w-full">Return to Login</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
