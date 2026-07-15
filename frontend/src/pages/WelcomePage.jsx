import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import JarMascot from '../components/JarMascot';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-j-bg flex flex-col relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-j-glow blur-[100px] rounded-full pointer-events-none" />

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-10 text-center relative z-10">
        {/* Mascot */}
        <div className="text-j-ink mb-12">
          <JarMascot size={110} fillLevel={0.4} animate />
        </div>

        <h1 className="text-5xl font-heading font-extrabold tracking-tighter text-j-ink mb-3">
          Jarr.
        </h1>
        <p className="text-[15px] font-medium text-j-ink-3 tracking-wide">
          Clearer financial habits
        </p>
      </div>

      {/* CTA section */}
      <div className="px-6 pb-16 max-w-sm w-full mx-auto relative z-10 flex flex-col gap-3">
        <Button
          fullWidth
          size="lg"
          onClick={() => navigate('/signup')}
          className="bg-j-ink !text-j-bg hover:opacity-90 active:opacity-80 rounded-sm font-semibold h-12 text-[15px]"
        >
          Create account
        </Button>
        <Button
          fullWidth
          size="lg"
          variant="ghost"
          onClick={() => navigate('/login')}
          className="text-j-ink-2 hover:text-j-ink hover:bg-j-surface-raised rounded-sm font-medium h-12 text-[15px] border border-j-border transition-colors duration-fast"
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
