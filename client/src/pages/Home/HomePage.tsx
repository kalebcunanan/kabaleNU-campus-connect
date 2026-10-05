import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

// Temporary landing spot after login until the trending feed is built.
export default function HomePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <section className="rounded-2xl border-t-4 border-nu-gold bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-nu-blue">Hello, {user.name}</h1>
        <p className="mt-2 text-gray-600">
          Signed in as {user.email} ({user.role}). Bulldog Score: {user.bulldogScore}
        </p>
        <Button variant="outline" className="mt-6" onClick={() => void logout().catch(() => undefined)}>
          Log out
        </Button>
      </section>
    </main>
  );
}
