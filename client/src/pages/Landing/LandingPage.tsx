import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';

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
  const navigate = useNavigate();

  if (isLoading) return <Loader label="Checking your session..." />;
  if (user) return <Navigate to="/home" replace />;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="max-w-3xl px-4">
        <h1 className="mb-6 text-4xl font-black tracking-tight text-nu-blue sm:text-5xl md:text-7xl">
          Welcome to <span className="text-nu-gold">Campus Connect</span>
        </h1>

        <p className="mb-10 text-lg text-gray-600 md:text-xl">
          The exclusive social platform for National University Clark students and faculty. Catch the trending
          newsfeed, register for campus events, buy and sell pre-loved essentials, and join interest-based channels.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button variant="gold" onClick={() => navigate('/register')} className="w-full px-8 py-3 text-lg sm:w-auto">
            Create an Account
          </Button>
          <Button variant="outline" onClick={() => navigate('/login')} className="w-full px-8 py-3 text-lg sm:w-auto">
            Login to Campus Connect
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-xl font-bold text-nu-blue">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
