import { useCallback, useEffect, useState } from 'react';
import Loader from '../../components/common/Loader';
import { Avatar } from '../../components/common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import api, { getErrorMessage } from '../../lib/axios';
import type { LeaderboardEntry } from '../../types/leaderboard';

const RANK_STYLES: Record<number, string> = {
  1: 'bg-nu-gold text-white',
  2: 'bg-gray-300 text-gray-700',
  3: 'bg-orange-300 text-orange-900',
};
const DEFAULT_RANK_STYLE = 'bg-gray-100 text-gray-500';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get<LeaderboardEntry[]>('/users/leaderboard');
      setLeaders(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 border-b-2 border-nu-gold pb-4 text-center">
        <h1 className="text-3xl font-bold text-nu-blue">Top Bulldogs</h1>
        <p className="mt-2 text-gray-600">Earn points by posting, reacting, and joining events!</p>
      </div>

      {loading ? (
        <Loader label="Fetching the top students..." />
      ) : error ? (
        <div role="alert" className="rounded-lg bg-red-50 p-6 text-center font-medium text-red-500">
          {error}
        </div>
      ) : leaders.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No scores yet. Start engaging to top the board!</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {leaders.map((student) => {
            const isCurrentUser = student._id === user?._id;
            return (
              <div
                key={student._id}
                className={`flex items-center justify-between border-b border-gray-100 p-4 last:border-0 ${
                  isCurrentUser ? 'bg-nu-gold/10' : ''
                }`}
              >
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold ${
                      RANK_STYLES[student.rank] ?? DEFAULT_RANK_STYLE
                    }`}
                  >
                    {student.rank}
                  </span>
                  <Avatar src={student.profilePicture} name={student.name} className="h-10 w-10" />
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-nu-blue">
                      {student.name}
                      {isCurrentUser && <span className="ml-2 text-xs font-semibold text-nu-gold">You</span>}
                    </h3>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      {student.role}
                      {student.program ? ` • ${student.program}` : ''}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xl font-black text-nu-gold">{student.bulldogScore}</span>
                  <span className="ml-1 text-xs text-gray-500">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}