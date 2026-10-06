import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

export default function LandingPage() {
  const { user } = useAuth();

  // Awtomatikong pumunta sa Home kapag naka-login na
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="max-w-3xl px-4">
        <h1 className="mb-6 text-5xl font-black tracking-tight text-nu-blue md:text-7xl">
          Welcome to <span className="text-nu-gold">Campus Connect</span>
        </h1>
        
        <p className="mb-10 text-lg text-gray-600 md:text-xl">
          The exclusive social platform for National University Clark Bulldogs. 
          Catch the trending newsfeed, register for campus events, buy and sell pre-loved essentials, 
          and join interest-based channels.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/register">
            <Button variant="gold" className="w-full px-8 py-3 text-lg sm:w-auto">
              Create an Account
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="w-full px-8 py-3 text-lg sm:w-auto">
              Login to Campus Connect
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-bold text-nu-blue">🐾 Trending Feed</h3>
            <p className="text-sm text-gray-600">See what's hot on campus right now through our Bulldog Reacts.</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-bold text-nu-blue">📅 Campus Events</h3>
            <p className="text-sm text-gray-600">Secure your slots instantly without double-booking.</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-bold text-nu-blue">🛍️ Marketplace</h3>
            <p className="text-sm text-gray-600">Find the best deals on pre-loved uniforms and books.</p>
          </div>
        </div>
      </div>
    </div>
  );
}