import { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../lib/axios';
import Loader from '../../components/common/Loader';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/leaderboard');
      setLeaders(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 border-b-2 border-nu-gold pb-4 text-center">
        <h1 className="text-3xl font-bold text-nu-blue">🏆 Top Bulldogs</h1>
        <p className="mt-2 text-gray-600">Earn points by posting, reacting, and joining events!</p>
      </div>

      {loading ? (
        <Loader label="Fetching the top students..." />
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-6 text-center font-medium text-red-500">{error}</div>
      ) : leaders.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No scores yet. Start engaging to top the board!</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {leaders.map((student, index) => (
            <div 
              key={student._id} 
              className={`flex items-center justify-between border-b border-gray-100 p-4 last:border-0 ${
                index === 0 ? 'bg-yellow-50/50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                  index === 0 ? 'bg-nu-gold text-white' : 
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-500'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-bold text-nu-blue">{student.name}</h3>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{student.role}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-nu-gold">{student.bulldogScore}</span>
                <span className="ml-1 text-xs text-gray-500">pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}