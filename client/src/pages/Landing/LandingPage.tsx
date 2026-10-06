import { Navigate } from 'react-router-dom';
import logo from '../../assets/logo/kabalenu-logo.png';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import AuthBackdrop from '../../components/layout/AuthBackdrop';
import { useAuth } from '../../hooks/useAuth';
import { useFadeNavigate } from '../../hooks/useFadeNavigate';

interface Feature {
  title: string;
  text: string;
}

const FEATURES: Feature[] = [
  { title: 'Trending Feed', text: "See what's hot on campus right now through our Bulldog Reacts." },
  { title: 'Campus Events', text: 'Secure your slots instantly without double-booking.' },
  { title: 'Marketplace', text: 'Find the best deals on pre-loved uniforms and books.' },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const { isLeaving, fadeTo } = useFadeNavigate();

  if (isLoading) return <Loader label="Checking your session..." />;
  if (user) return <Navigate to="/home" replace />;

  return (
    <AuthBackdrop className="relative min-h-dvh">
      <main
        className={`relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-8 text-center transition-opacity duration-200 ${isLeaving ? 'pointer-events-none opacity-0' : ''}`}
      >
        <div className="max-w-3xl">
          <img src={logo} alt="KabaleNU" className="mx-auto mb-4 h-32 w-auto object-contain sm:h-44" />

          <h1 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
            Welcome to <span className="text-nu-gold">Campus Connect</span>
          </h1>

          <p className="mb-10 text-lg text-white/90 md:text-xl">
            The exclusive social platform for National University Clark students and faculty. Catch the trending
            newsfeed, register for campus events, buy and sell pre-loved essentials, and join interest-based channels.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="gold" onClick={() => fadeTo('/register')} className="w-full px-8 py-3 text-lg sm:w-auto">
              Create an Account
            </Button>
            <Button
              variant="outline"
              onClick={() => fadeTo('/login')}
              className="w-full !border-white !text-white hover:!bg-white/10 px-8 py-3 text-lg sm:w-auto"
            >
              Login to Campus Connect
            </Button>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-xl bg-white p-6 shadow-lg">
                <h3 className="mb-2 text-xl font-bold text-nu-blue">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AuthBackdrop>
  );
}
