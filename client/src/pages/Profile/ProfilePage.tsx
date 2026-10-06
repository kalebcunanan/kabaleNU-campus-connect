import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border-t-4 border-nu-gold bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-nu-blue">My Profile</h1>
          <span className="rounded-full bg-nu-blue px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
            {user.role}
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="text-lg font-bold text-gray-900">{user.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email Address</label>
            <p className="text-lg font-bold text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Total Bulldog Score</label>
            <p className="text-2xl font-black text-nu-gold">{user.bulldogScore} pts</p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <Button variant="outline" onClick={() => void logout().catch(() => undefined)} className="w-full sm:w-auto">
            Log out from Campus Connect
          </Button>
        </div>
      </div>
    </main>
  );
}